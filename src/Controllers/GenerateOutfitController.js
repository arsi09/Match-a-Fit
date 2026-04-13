import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend base URL exposed by Expo env.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Storage keys shared across auth/outfit flows.
const CURRENT_USER_KEY = 'matchafit_currentUser';
const OUTFIT_LIBRARY_KEY = 'matchafit_outfitLibrary';

// Target slots used by the outfit library UI.
const SLOT_LABELS = ['Shirt', 'Pants', 'Dress', 'Shorts/Skirt', 'Jacket/Hoodie'];

// Maps variant category names into the exact slot labels above.
const SLOT_ALIASES = {
	shirt: 'Shirt',
	top: 'Shirt',
	pants: 'Pants',
	trouser: 'Pants',
	trousers: 'Pants',
	dress: 'Dress',
	skirt: 'Shorts/Skirt',
	shorts: 'Shorts/Skirt',
	jacket: 'Jacket/Hoodie',
	hoodie: 'Jacket/Hoodie',
};

class GenerateOutfitController {
	// Converts raw closet category text into a normalized outfit slot name.
	static normalizeSlot(category = '') {
		const key = String(category).trim().toLowerCase();
		return SLOT_ALIASES[key] || null;
	}

	// Standardizes closet item shape so downstream generation logic is predictable.
	static normalizeClosetItems(rawItems = []) {
		if (!Array.isArray(rawItems)) {
			return [];
		}

		return rawItems.map((item, index) => {
			const category = item.category || item.clothing_type || item.type || 'Unknown';
			return {
				id: item.id ?? `closet-${index}-${Date.now()}`,
				category,
				color: item.color || 'Unknown color',
				occasion: item.occasion || 'Casual',
			};
		});
	}

	// Gets the currently logged-in user from local storage.
	static async getCurrentUser() {
		try {
			const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (error) {
			return null;
		}
	}

	// Loads closet items from backend for a specific user and normalizes them.
	static async loadClosetItems(userId) {
		if (!API_URL || !userId) {
			return [];
		}

		try {
			const response = await fetch(`${API_URL}/photo-upload/user/${userId}`);
			const data = await response.json();

			const items = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
			return this.normalizeClosetItems(items);
		} catch (error) {
			return [];
		}
	}

	// Builds a usable local outfit when AI/backend output is unavailable.
	static buildLocalOutfit(closetItems = [], occasion = 'Casual', timeOfDay = 'Anytime') {
		const itemsBySlot = {};
		SLOT_LABELS.forEach((slot) => {
			itemsBySlot[slot] = 'N/A';
		});

		// Fill each slot once using the first matching closet item.
		closetItems.forEach((item) => {
			const slot = this.normalizeSlot(item.category);
			if (!slot || itemsBySlot[slot] !== 'N/A') {
				return;
			}

			const descriptor = item.color && item.color !== 'Unknown color'
				? `${item.color} ${slot}`
				: slot;

			itemsBySlot[slot] = descriptor;
		});

		return {
			id: `outfit-${Date.now()}`,
			occasion,
			timeOfDay,
			items: itemsBySlot,
			createdAt: new Date().toISOString(),
		};
	}

	// Persists generated outfit into local library storage (latest first).
	static async saveOutfitToLibrary(outfit) {
		const raw = await AsyncStorage.getItem(OUTFIT_LIBRARY_KEY);
		const saved = raw ? JSON.parse(raw) : [];

		const next = [outfit, ...saved];
		await AsyncStorage.setItem(OUTFIT_LIBRARY_KEY, JSON.stringify(next));

		return next;
	}

	// Main entry point: resolve input, try backend generation, then fall back locally.
	static async generateOutfit(input = {}, fallbackClosetItems = []) {
		const options = typeof input === 'string' ? { occasion: input } : (input || {});
		const occasion = options.occasion || options.targetOccasion || 'Casual';
		const timeOfDay = options.timeOfDay || 'Anytime';

		const user = await this.getCurrentUser();
		const userId = options.userId || user?.id;

		// Prefer provided closet items, otherwise load from API using current user.
		let closetItems = this.normalizeClosetItems(options.closetItems || fallbackClosetItems);
		if (closetItems.length === 0 && userId) {
			closetItems = await this.loadClosetItems(userId);
		}

		// Try backend AI generation first when API is configured.
		if (API_URL) {
			try {
				const response = await fetch(`${API_URL}/generate-outfit`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						closet_items: closetItems,
						target_occasion: occasion,
					}),
				});

				if (response.ok) {
					const data = await response.json();
					const remoteOutfit = data?.outfit;

					if (remoteOutfit && typeof remoteOutfit === 'object') {
						// Normalize backend response to match frontend outfit-card expectations.
						const normalized = {
							id: remoteOutfit.id || `outfit-${Date.now()}`,
							occasion: remoteOutfit.occasion || occasion,
							timeOfDay: remoteOutfit.timeOfDay || timeOfDay,
							items: remoteOutfit.items || this.buildLocalOutfit(closetItems, occasion, timeOfDay).items,
							createdAt: remoteOutfit.createdAt || new Date().toISOString(),
						};

						return {
							success: true,
							outfit: normalized,
							suggestion: data?.suggestion || null,
							source: 'api',
						};
					}
				}
			} catch (error) {
				// Continue with local fallback generation when API call is unavailable.
			}
		}

		// Guaranteed fallback path so UI can still render an outfit.
		const localOutfit = this.buildLocalOutfit(closetItems, occasion, timeOfDay);

		return {
			success: true,
			outfit: localOutfit,
			suggestion: null,
			source: 'local',
		};
	}
}

export default GenerateOutfitController;
