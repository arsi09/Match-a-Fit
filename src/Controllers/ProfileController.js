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

  static getDisplayName(user) {
    if (!user) return "User";

    if (user.username) return user.username;

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`.trim();
    }

    if (user.firstName) return user.firstName;

    if (user.email) {
      return String(user.email).split("@")[0] || "User";
    }

    return "User";
  }

  static async loadProfile() {
    const user = await this.getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "No user found. Please log in again.",
      };
    }

    return {
      success: true,
      data: {
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
        phnNumber: user.phnNumber || user.phn_number || "",
        email: user.email || "",
        age: user.age ? String(user.age) : "",
        gender: user.gender || "",
        id: user.id,
        displayName: this.getDisplayName(user),
      },
    };
  }

  static async updateProfile(updates = {}) {
    try {
      const user = await this.getCurrentUser();

      if (!user) {
        return {
          success: false,
          message: "No user found. Please log in again.",
        };
      }

      const merged = {
        ...user,
        ...updates,
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(merged));

      const userDataRaw = await AsyncStorage.getItem(USER_DATA_KEY);

      if (userDataRaw) {
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(merged));
      }

      if (API_URL && merged.id) {
        try {
          await fetch(`${API_URL}/profile/${merged.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstName: merged.firstName,
              lastName: merged.lastName,
              phnNumber: merged.phnNumber,
              email: merged.email,
              age: merged.age,
              gender: merged.gender,
            }),
          });
        } catch (error) {
          // Backend sync failed, but local update already worked.
        }
      }

      return {
        success: true,
        message: "Profile updated successfully.",
        data: merged,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update profile.",
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
          message: "New password and confirm password do not match.",
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: "New password must be at least 6 characters.",
        };
      }

      const user = await this.getCurrentUser();

      if (!user || !user.id) {
        return {
          success: false,
          message: "No user found. Please log in again.",
        };
      }

      if (API_URL) {
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

        if (!response.ok) {
          return {
            success: false,
            message: "Password update failed.",
          };
        }
      }

      return {
        success: true,
        message: "Password updated successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update password.",
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
}

export default ProfileController;