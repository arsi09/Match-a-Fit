/**
 * OutfitLibraryController.js
 * Purpose:
 * - Connects OutfitLibraryScreen to the backend
 * - Loads saved outfits for the current user
 * - Deletes outfits
 * - Filters outfits by occasion
 * - Converts base64 image text into a displayable image URI
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CURRENT_USER_KEY = 'matchafit_currentUser';

class OutfitLibraryController {
  /**
   * Gets the current logged-in user from AsyncStorage
   */
  static async getCurrentUser() {
    try {
      const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Loads outfits for the current user from the backend
   */
  static async loadOutfits() {
    const user = await this.getCurrentUser();
    const userId = user?.id;

    if (!API_URL) {
      throw new Error('API URL is missing. Check EXPO_PUBLIC_API_URL.');
    }

    if (!userId) {
      throw new Error('No logged in user found.');
    }

    const response = await fetch(`${API_URL}/outfit-library/user/${userId}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to load outfits');
    }

    return Array.isArray(data.outfits) ? data.outfits : [];
  }

  /**
   * Deletes one outfit for the current user
   */
  static async deleteOutfit(outfitId) {
    const user = await this.getCurrentUser();
    const userId = user?.id;

    if (!API_URL) {
      throw new Error('API URL is missing. Check EXPO_PUBLIC_API_URL.');
    }

    if (!userId) {
      throw new Error('No logged in user found.');
    }

    if (!outfitId) {
      throw new Error('Outfit ID is required.');
    }

    const response = await fetch(`${API_URL}/outfit-library/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        outfit_id: outfitId,
        user_id: userId,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete outfit');
    }

    return data;
  }

  /**
   * Filters outfits by occasion on the frontend
   */
  static filterByOccasion(outfits = [], selectedOccasion = 'All') {
    if (!Array.isArray(outfits)) {
      return [];
    }

    if (!selectedOccasion || String(selectedOccasion).trim().toLowerCase() === 'all') {
      return outfits;
    }

    const selected = String(selectedOccasion).trim().toLowerCase();

    return outfits.filter((outfit) => {
      return String(outfit?.occasion || '').trim().toLowerCase() === selected;
    });
  }

  /**
   * Converts image data into a URI React Native can display
   *
   * Handles:
   * - already formatted data URIs
   * - raw base64 text from database like "/9j/4AAQ..."
   * - a few possible property names
   */
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

    return `data:image/jpeg;base64,${cleaned}`;
  }
}

export default OutfitLibraryController;