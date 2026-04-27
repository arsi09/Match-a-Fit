/**
 * ViewClosetController.js
 * Purpose:
 * - Connects ViewClosetScreen to the backend
 * - Loads saved clothing items for the current user
 * - Deletes clothing items
 * - Filters items by type
 * - Converts base64 image text into a displayable image URI
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CURRENT_USER_KEY = 'matchafit_currentUser';

class ViewClosetController {
  static async getCurrentUser() {
    try {
      const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  static async loadItems(page = 1, limit = 10) {
    const user = await this.getCurrentUser();
    const userId = user?.id;

    if (!API_URL) {
      throw new Error('API URL is missing. Check EXPO_PUBLIC_API_URL.');
    }

    if (!userId) {
      throw new Error('No logged in user found.');
    }

    const response = await fetch(
      `${API_URL}/view-closet/user/${userId}?page=${page}&limit=${limit}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to load clothing items');
    }

    return {
      items: Array.isArray(data.items) ? data.items : [],
      page: data.page || page,
      limit: data.limit || limit,
      hasMore: Boolean(data.hasMore),
    };
  }

  static async deleteItem(itemId) {
    const user = await this.getCurrentUser();
    const userId = user?.id;

    if (!API_URL) {
      throw new Error('API URL is missing. Check EXPO_PUBLIC_API_URL.');
    }

    if (!userId) {
      throw new Error('No logged in user found.');
    }

    if (!itemId) {
      throw new Error('Item ID is required.');
    }

    const response = await fetch(`${API_URL}/view-closet/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_id: itemId,
        user_id: userId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete clothing item');
    }

    return data;
  }

  static filterByType(items = [], selectedType = 'All') {
    if (!Array.isArray(items)) {
      return [];
    }

    if (!selectedType || String(selectedType).trim().toLowerCase() === 'all') {
      return items;
    }

    const selected = String(selectedType).trim().toLowerCase();

    return items.filter((item) => {
      return String(item?.type || '').trim().toLowerCase() === selected;
    });
  }

  static getPhotoUri(item) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const raw =
      item.photoUri ||
      item.photo ||
      item.image ||
      item.image_text ||
      item.photo_text ||
      item.photo_base64 ||
      item.image_base64 ||
      null;

    if (!raw || typeof raw !== 'string') {
      return null;
    }

    const cleaned = raw.trim();

    if (!cleaned) {
      return null;
    }

    if (cleaned.startsWith('data:image')) {
      return cleaned;
    }

    const mimeType = item.image_mime || 'image/jpeg';
    return `data:${mimeType};base64,${cleaned}`;
  }
}

export default ViewClosetController;