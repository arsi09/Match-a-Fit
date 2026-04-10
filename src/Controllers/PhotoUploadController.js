/**
 * Created for Match-a-Fit by Juan Marco Saca
 * PhotoUploadController.js
 * Purpose:
 * - Handles image picker permissions
 * - Opens camera or photo library
 * - Sends clothing item data to the backend API
 */

import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

class PhotoUploadController {
  // Opens the camera after asking for permission
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

  // Opens the photo library after asking for permission
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

  // Sends the clothing item to the backend
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

    const formData = new FormData();

    // Temporary hardcoded user id until login/user session is connected
    formData.append('user_id', '1');
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