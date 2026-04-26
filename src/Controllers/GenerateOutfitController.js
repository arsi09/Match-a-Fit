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

      if (!API_URL) {
        return {
          success: false,
          error: "API URL is missing. Check your .env file.",
        };
      }

      const userId = await this.getCurrentUserId();

      if (!userId) {
        return {
          success: false,
          error: "User not found. Please log in again.",
        };
      }

      const attemptRequest = async () => {
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

        return { response, data };
      };

      // Try up to 3 times in case Gemini is temporarily busy
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { response, data } = await attemptRequest();

        if (response.ok && data.success) {
          return {
            success: true,
            outfits: data.outfits || [],
            saved_outfits: data.saved_outfits || [],
            response_text: data.response_text || "",
          };
        }

        const errorMessage = data?.error || "";

        const isTemporaryGeminiError =
          errorMessage.includes("503") ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("high demand");

        if (isTemporaryGeminiError && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }

        return {
          success: false,
          error: errorMessage || "Failed to generate outfit",
        };
      }

      return {
        success: false,
        error: "AI is busy right now. Please try again.",
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