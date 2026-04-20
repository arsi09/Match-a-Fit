import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_USER_KEY = "matchafit_currentUser";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

class GenerateOutfitController {
  static async getCurrentUserId() {
    try {
      const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);

      if (!storedUser) {
        return null;
      }

      const parsedUser = JSON.parse(storedUser);

      return parsedUser?.id || null;
    } catch (error) {
      console.log("GET CURRENT USER ERROR:", error);
      return null;
    }
  }

  static async generateOutfit({ occasion, weather = null }) {
    try {
      if (!occasion) {
        return {
          success: false,
          error: "Occasion is required",
        };
      }

      const userId = await this.getCurrentUserId();

      if (!userId) {
        return {
          success: false,
          error: "User not found. Please log in again.",
        };
      }

      const response = await fetch(`${API_URL}/outfits/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          occasion,
          weather,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data?.error || "Failed to generate outfit",
        };
      }

      return {
        success: true,
        outfits: data.outfits || [],
        response_text: data.response_text || "",
      };
    } catch (error) {
      console.log("GENERATE OUTFIT ERROR:", error);
      return {
        success: false,
        error: "Could not connect to the server",
      };
    }
  }
}

export default GenerateOutfitController;