import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL from Expo environment.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Shared storage keys used across controllers.
const CURRENT_USER_KEY = 'matchafit_currentUser';
const USER_DATA_KEY = 'userData';
const OUTFIT_LIBRARY_KEY = 'matchafit_outfitLibrary';
const CLOSET_ITEMS_KEY = 'matchafit_closetItems';

class ProfileController {
	// Reads user object from local storage using the same key order as HomeController.
	static async getCurrentUser() {
		try {
			const currentUserRaw = await AsyncStorage.getItem(CURRENT_USER_KEY);
			if (currentUserRaw) {
				return JSON.parse(currentUserRaw);
			}

			const userDataRaw = await AsyncStorage.getItem(USER_DATA_KEY);
			if (userDataRaw) {
				return JSON.parse(userDataRaw);
			}

			return null;
		} catch (error) {
			return null;
		}
	}

	// Builds a stable display name from whatever fields exist on the user object.
	static getDisplayName(user) {
		if (!user) {
			return 'User';
		}

		if (user.username) {
			return user.username;
		}

		if (user.firstName && user.lastName) {
			return `${user.firstName} ${user.lastName}`.trim();
		}

		if (user.firstName) {
			return user.firstName;
		}

		if (user.email) {
			return String(user.email).split('@')[0] || 'User';
		}

		return 'User';
	}

	// Returns profile payload ready for UI rendering and optional enrichments.
	static async loadProfile() {
		const user = await this.getCurrentUser();
		if (!user) {
			return {
				success: false,
				error: 'No user found. Please log in again.',
			};
		}

		const profile = {
			...user,
			displayName: this.getDisplayName(user),
		};

		return {
			success: true,
			profile,
		};
	}

	// Updates local profile first for instant UI feedback, then attempts backend sync.
	static async updateProfile(updates = {}) {
		try {
			const user = await this.getCurrentUser();

			if (!user) {
				return {
					success: false,
					error: 'No user found. Please log in again.',
				};
			}

			const merged = {
				...user,
				...updates,
			};

			await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(merged));

			// Keep fallback key in sync when it exists in this project.
			const userDataRaw = await AsyncStorage.getItem(USER_DATA_KEY);
			if (userDataRaw) {
				await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(merged));
			}

			if (API_URL && merged.id) {
				try {
					await fetch(`${API_URL}/profile/${merged.id}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(merged),
					});
				} catch (error) {
					// Local update already succeeded; keep UI usable if backend is unavailable.
				}
			}

			return {
				success: true,
				profile: {
					...merged,
					displayName: this.getDisplayName(merged),
				},
			};
		} catch (error) {
			return {
				success: false,
				error: 'Failed to update profile.',
			};
		}
	}

	// Provides simple profile metrics commonly shown on profile dashboards.
	static async loadProfileStats() {
		try {
			const closetRaw = await AsyncStorage.getItem(CLOSET_ITEMS_KEY);
			const outfitsRaw = await AsyncStorage.getItem(OUTFIT_LIBRARY_KEY);

			const closetItems = closetRaw ? JSON.parse(closetRaw) : [];
			const outfits = outfitsRaw ? JSON.parse(outfitsRaw) : [];

			return {
				success: true,
				stats: {
					closetCount: Array.isArray(closetItems) ? closetItems.length : 0,
					outfitsCount: Array.isArray(outfits) ? outfits.length : 0,
				},
			};
		} catch (error) {
			return {
				success: true,
				stats: {
					closetCount: 0,
					outfitsCount: 0,
				},
			};
		}
	}

	// Clears auth/session-related keys from local storage.
	static async logout() {
		try {
			await AsyncStorage.multiRemove([
				'authToken',
				'userId',
				CURRENT_USER_KEY,
				USER_DATA_KEY,
			]);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: 'Failed to logout. Please try again.',
			};
		}
	}
}

export default ProfileController;
