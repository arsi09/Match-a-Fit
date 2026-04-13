import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CURRENT_USER_KEY = 'matchafit_currentUser';
const OUTFIT_LIBRARY_KEY = 'matchafit_outfitLibrary';

const REQUIRED_SLOTS = ['Shirt', 'Pants', 'Dress', 'Shorts/Skirt', 'Jacket/Hoodie'];

class OutfitLibraryController {
	static normalizeOutfit(rawOutfit = {}, index = 0) {
		const safeItems = {};

		REQUIRED_SLOTS.forEach((slot) => {
			safeItems[slot] = rawOutfit?.items?.[slot] || 'N/A';
		});

		return {
			id: rawOutfit.id ?? `local-${Date.now()}-${index}`,
			occasion: rawOutfit.occasion || 'Casual',
			timeOfDay: rawOutfit.timeOfDay || 'Anytime',
			items: safeItems,
			createdAt: rawOutfit.createdAt || new Date().toISOString(),
		};
	}

	static normalizeOutfits(outfits = []) {
		if (!Array.isArray(outfits)) {
			return [];
		}

		return outfits.map((outfit, index) => this.normalizeOutfit(outfit, index));
	}

	static async loadLocalOutfits() {
		const raw = await AsyncStorage.getItem(OUTFIT_LIBRARY_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return this.normalizeOutfits(parsed);
	}

	static async saveLocalOutfits(outfits = []) {
		await AsyncStorage.setItem(OUTFIT_LIBRARY_KEY, JSON.stringify(outfits));
	}

	static async getCurrentUser() {
		try {
			const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (error) {
			return null;
		}
	}

	static async loadOutfits() {
		const localOutfits = await this.loadLocalOutfits();

		if (!API_URL) {
			return localOutfits;
		}

		try {
			const user = await this.getCurrentUser();

			if (!user?.id) {
				return localOutfits;
			}

			const response = await fetch(`${API_URL}/outfits/user/${user.id}`);
			const data = await response.json();

			if (!response.ok || !data?.success) {
				return localOutfits;
			}

			const apiOutfits = this.normalizeOutfits(data.outfits || []);

			if (apiOutfits.length > 0) {
				await this.saveLocalOutfits(apiOutfits);
			}

			return apiOutfits;
		} catch (error) {
			return localOutfits;
		}
	}

	static filterByOccasion(outfits = [], activeOccasion = 'All') {
		const normalized = this.normalizeOutfits(outfits);

		if (!activeOccasion || activeOccasion === 'All') {
			return normalized;
		}

		const target = String(activeOccasion).trim().toLowerCase();
		return normalized.filter((outfit) => String(outfit.occasion).trim().toLowerCase() === target);
	}

	static async deleteOutfit(outfitId, currentOutfits = []) {
		const normalized = this.normalizeOutfits(currentOutfits);
		const updated = normalized.filter((outfit) => String(outfit.id) !== String(outfitId));

		await this.saveLocalOutfits(updated);

		if (!API_URL) {
			return updated;
		}

		try {
			await fetch(`${API_URL}/outfits/${outfitId}`, {
				method: 'DELETE',
			});
		} catch (error) {
			// Keep the UI responsive by returning locally updated state even if API delete fails.
		}

		return updated;
	}
}

export default OutfitLibraryController;
