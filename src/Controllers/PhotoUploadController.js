/**
 * Created for Match-a-Fit by Juan Marco Saca
 * PhotoUploadController.js
 *
 * Purpose:
 * - Handles permissions for camera and photo library
 * - Allows user to take or pick a photo
 * - Sends the selected clothing item to the backend API
 */

// Import Expo ImagePicker to access camera & photo library
import * as ImagePicker from 'expo-image-picker';

// Import AsyncStorage to retrieve the logged-in user
import AsyncStorage from '@react-native-async-storage/async-storage';

// Load API base URL from environment variables (.env file)
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Key used to store/retrieve the current logged-in user
const CURRENT_USER_KEY = 'matchafit_currentUser';

// Create a controller class to group all photo upload logic
class PhotoUploadController {

  /**
   * Opens the device camera after requesting permission
   */
  static async takePhoto() {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      throw new Error('Camera permission is required to take a photo.');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets?.[0]?.uri || null;
  }

  /**
   * Opens the photo library after requesting permission
   */
  static async pickFromLibrary() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      throw new Error('Photo library permission is required to upload an image.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets?.[0]?.uri || null;
  }

  /**
   * Sends the selected clothing item to the backend API
   */
  static async saveClothingItem({ photoUri, category, occasion }) {
    if (!photoUri) {
      throw new Error('Please select a photo first.');
    }

    if (!category) {
      throw new Error('Please select a category.');
    }

    if (!occasion) {
      throw new Error('Please select an occasion.');
    }

    if (!API_URL) {
      throw new Error('API URL is missing. Check EXPO_PUBLIC_API_URL in your environment.');
    }

    const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);

    if (!storedUser) {
      throw new Error('No logged-in user found. Please log in first.');
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (error) {
      throw new Error('Stored user data is invalid. Please log in again.');
    }

    if (!parsedUser?.id) {
      throw new Error('Logged-in user ID is missing. Please log in again.');
    }

    const formData = new FormData();

    formData.append('user_id', String(parsedUser.id));
    formData.append('clothing_type', category);
    formData.append('occasion', occasion);

    formData.append('image', {
      uri: photoUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const response = await fetch(`${API_URL}/photo-upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }
}

export default PhotoUploadController;