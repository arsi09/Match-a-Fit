import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CURRENT_USER_KEY = "matchafit_currentUser";
const USER_DATA_KEY = "userData";
const OUTFIT_LIBRARY_KEY = "matchafit_outfitLibrary";
const CLOSET_ITEMS_KEY = "matchafit_closetItems";

class ProfileController {
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

  static async saveUserLocally(user) {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    const userDataRaw = await AsyncStorage.getItem(USER_DATA_KEY);

    if (userDataRaw) {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    }
  }

  static async loadProfile() {
    const user = await this.getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        message: "No user found. Please log in again.",
      };
    }

    if (API_URL) {
      try {
        const response = await fetch(`${API_URL}/profile/${user.id}`);
        const result = await response.json();

        if (response.ok && result.profile) {
          await this.saveUserLocally(result.profile);

          return {
            success: true,
            data: result.profile,
          };
        }

        return {
          success: false,
          message: result.message || "Failed to load profile.",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to load profile. API error: ${String(error)}`,
        };
      }
    }

    return {
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
        phnNumber: user.phnNumber || user.phn_number || "",
        email: user.email || "",
        age: user.age ? String(user.age) : "",
        gender: user.gender || "",
      },
    };
  }

  static async updateProfile(updates = {}) {
    try {
      const user = await this.getCurrentUser();

      if (!user || !user.id) {
        return {
          success: false,
          message: "No user found. Please log in again.",
        };
      }

      if (!API_URL) {
        return {
          success: false,
          message: "API URL is missing. Check EXPO_PUBLIC_API_URL.",
        };
      }

      const response = await fetch(`${API_URL}/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: updates.firstName,
          lastName: updates.lastName,
          phnNumber: updates.phnNumber,
          email: updates.email,
          age: updates.age,
          gender: updates.gender,
        }),
      });

      const result = await response.json();


      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Server error updating profile.",
        };
      }

      const updatedProfile = result.profile || {
        ...user,
        ...updates,
      };

      await this.saveUserLocally(updatedProfile);

      return {
        success: true,
        message: result.message || "Profile updated successfully.",
        data: updatedProfile,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update profile. API error: ${String(error)}`,
      };
    }
  }

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

  static async logout() {
    try {
      await AsyncStorage.multiRemove([
        "authToken",
        "userId",
        CURRENT_USER_KEY,
        USER_DATA_KEY,
      ]);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: "Failed to logout. Please try again.",
      };
    }
  }

  static async changePassword(passwordData = {}) {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return {
          success: false,
          message: "Please fill out all password fields.",
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match.",
        };
      }

      const user = await this.getCurrentUser();

      const response = await fetch(`${API_URL}/profile/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      return result;

    } catch (error) {
      return {
        success: false,
        message: "Password update failed.",
      };
    }
  }

}

export default ProfileController;