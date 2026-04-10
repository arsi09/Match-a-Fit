import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const CURRENT_USER_KEY = 'matchafit_currentUser';
const USER_DATA_KEY = 'userData';

const NAVIGATION_ROUTES = {
  uploadPhoto: '/PhotoUpload',
  viewCloset: '/ViewCloset',
  generateOutfit: '/GenerateOutfit',
  outfitLibrary: '/OutfitLibrary',
  profile: '/Profile',
};

export class HomeController {
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

  static async getDisplayName() {
    const user = await this.getCurrentUser();

    if (!user) {
      return 'User';
    }

    if (user.username) {
      return user.username;
    }

    if (user.firstName) {
      return user.firstName;
    }

    if (user.email) {
      return user.email.split('@')[0] || 'User';
    }

    return 'User';
  }

  static async logout() {
    try {
      await AsyncStorage.multiRemove([
        'authToken',
        'userId',
        USER_DATA_KEY,
        CURRENT_USER_KEY,
      ]);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to logout. Please try again.' };
    }
  }

  static async handleLogoutFromScreen({ setError } = {}) {
    const result = await this.logout();

    if (!result.success) {
      if (typeof setError === 'function') {
        setError(result.error);
      }

      return result;
    }

    router.replace('/');

    return result;
  }

  static handleHomeAction(action) {
    const routeName = NAVIGATION_ROUTES[action];

    if (!routeName) {
      return {
        success: false,
        title: 'Feature Not Available',
        message: 'This action is not configured yet.',
      };
    }

    router.push(routeName);
    return { success: true };
  }

  static createBindings() {
    return {
      onOpenProfile: () => this.handleHomeAction('profile'),
      onOpenUploadPhoto: () => this.handleHomeAction('uploadPhoto'),
      onOpenCloset: () => this.handleHomeAction('viewCloset'),
      onOpenGenerateOutfit: () => this.handleHomeAction('generateOutfit'),
      onOpenOutfitLibrary: () => this.handleHomeAction('outfitLibrary'),
      onLogout: () => this.handleLogoutFromScreen(),
    };
  }
}