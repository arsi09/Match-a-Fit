import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CURRENT_USER_KEY = 'matchafit_currentUser';
const USER_DATA_KEY = 'userData';
const CLOSET_ITEMS_KEY = 'matchafit_closetItems';

class ViewClosetController {
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

  static redirectToLogin() {
    router.replace('/LoginScreen');
  }

  static goBack() {
    router.back();
  }

  static normalizeCategory(rawCategory = '') {
    const value = String(rawCategory || '').trim().toLowerCase();

    if (
      value === 'shirt' ||
      value === 'top' ||
      value === 't-shirt' ||
      value === 'tshirt' ||
      value === 'blouse'
    ) {
      return 'Shirt';
    }

    if (value === 'pants' || value === 'jeans' || value === 'trousers') {
      return 'Pants';
    }

    if (value === 'dress') {
      return 'Dress';
    }

    if (value === 'shorts' || value === 'skirt' || value === 'shorts/skirt') {
      return 'Shorts/Skirt';
    }

    if (
      value === 'jacket' ||
      value === 'hoodie' ||
      value === 'jacket/hoodie' ||
      value === 'coat'
    ) {
      return 'Jacket/Hoodie';
    }

    if (value === 'shoe' || value === 'shoes' || value === 'footwear') {
      return 'Shoes';
    }

    return rawCategory || 'Unknown';
  }

  static normalizeClothingItems(rawItems = []) {
    if (!Array.isArray(rawItems)) {
      return [];
    }

    return rawItems.map((item, index) => ({
      id: item.id ?? `closet-${index}-${Date.now()}`,
      category: this.normalizeCategory(
        item.type || item.category || item.clothing_type || 'Unknown'
      ),
      occasion: item.occasion || 'Casual',
      uploadedAt: item.uploaded_at || item.uploadedAt || new Date().toISOString(),
      userId: item.user_id || item.userId || null,
      image: item.image || null,
      image_mime: item.image_mime || 'image/jpeg',
      image_filename: item.image_filename || '',
    }));
  }

  static async clearClosetCache() {
    try {
      await AsyncStorage.removeItem(CLOSET_ITEMS_KEY);
    } catch (error) {
      // ignore
    }
  }

  static async loadClothingItems(userId) {
    if (!API_URL || !userId) {
      return [];
    }

    try {
      const response = await fetch(`${API_URL}/photo-upload/user/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to load closet items: ${response.status}`);
      }

      const data = await response.json();

      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];

      const normalizedItems = this.normalizeClothingItems(rawItems);

      await AsyncStorage.setItem(CLOSET_ITEMS_KEY, JSON.stringify(normalizedItems));

      return normalizedItems;
    } catch (error) {
      console.log('loadClothingItems error:', error);
      return [];
    }
  }

  static async deleteClothingItem(itemId, clothingItems = []) {
    const normalized = this.normalizeClothingItems(clothingItems);
    const updated = normalized.filter((item) => String(item.id) !== String(itemId));

    await AsyncStorage.setItem(CLOSET_ITEMS_KEY, JSON.stringify(updated));

    if (API_URL) {
      try {
        await fetch(`${API_URL}/photo-upload/${itemId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        // keep local state even if backend delete fails
      }
    }

    return updated;
  }

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