import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL from Expo environment configuration.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Shared local-storage keys used in this app.
const CURRENT_USER_KEY = 'matchafit_currentUser';
const USER_DATA_KEY = 'userData';
const CLOSET_ITEMS_KEY = 'matchafit_closetItems';

class ViewClosetController {
  // Reads current user from local storage using the same fallback pattern as other controllers.
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

  // Normalizes clothing item shape so the screen can safely render category/color/date fields.
  static normalizeClothingItems(rawItems = []) {
    if (!Array.isArray(rawItems)) {
      return [];
    }

    return rawItems.map((item, index) => ({
      id: item.id ?? `closet-${index}-${Date.now()}`,
      category: item.category || item.clothing_type || item.type || 'Unknown',
      color: item.color || '#93c5fd',
      occasion: item.occasion || 'Casual',
      uploadedAt: item.uploadedAt || item.uploaded_at || new Date().toISOString(),
      userId: item.userId || item.user_id || null,
    }));
  }

  // Loads clothing items from backend when available, otherwise returns local cached items.
  static async loadClothingItems(userId) {
    let localItems = [];

    try {
      const localRaw = await AsyncStorage.getItem(CLOSET_ITEMS_KEY);
      localItems = this.normalizeClothingItems(localRaw ? JSON.parse(localRaw) : []);
    } catch (error) {
      localItems = [];
    }

    if (!API_URL || !userId) {
      return localItems;
    }

    try {
      const response = await fetch(`${API_URL}/photo-upload/user/${userId}`);
      const data = await response.json();

      const apiItems = this.normalizeClothingItems(
        Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
      );

      await AsyncStorage.setItem(CLOSET_ITEMS_KEY, JSON.stringify(apiItems));
      return apiItems;
    } catch (error) {
      return localItems;
    }
  }

  // Deletes an item locally first for immediate UI update, then attempts backend delete.
  static async deleteClothingItem(itemId, clothingItems = [], user = null) {
    const normalized = this.normalizeClothingItems(clothingItems);
    const updated = normalized.filter((item) => String(item.id) !== String(itemId));

    await AsyncStorage.setItem(CLOSET_ITEMS_KEY, JSON.stringify(updated));

    if (API_URL) {
      try {
        await fetch(`${API_URL}/photo-upload/${itemId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        // Keep local state as source of truth when delete API is unavailable.
      }
    }

    return updated;
  }

  // Counts items in one category (case-insensitive) for the category badges.
  static countByCategory(clothingItems = [], category = '') {
    const target = String(category).trim().toLowerCase();
    if (!target) {
      return 0;
    }

    return this.normalizeClothingItems(clothingItems).filter((item) => {
      return String(item.category).trim().toLowerCase() === target;
    }).length;
  }
}

export default ViewClosetController;
