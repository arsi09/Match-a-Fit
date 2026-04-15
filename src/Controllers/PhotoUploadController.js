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

    // Ask the user for permission to use the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    // If permission is denied, stop and throw an error
    if (!permissionResult.granted) {
      throw new Error('Camera permission is required to take a photo.');
    }

    // Launch the camera interface
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
      allowsEditing: true, // Allow user to crop/edit the image
      quality: 1, // Highest quality
    });

    // If the user cancels taking a photo, return null
    if (result.canceled) {
      return null;
    }

    // Return the URI (file path) of the captured image
    return result.assets?.[0]?.uri || null;
  }

  /**
   * Opens the photo library after requesting permission
   */
  static async pickFromLibrary() {

    // Ask the user for permission to access their photo library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // If permission is denied, stop and throw an error
    if (!permissionResult.granted) {
      throw new Error('Photo library permission is required to upload an image.');
    }

    // Launch the image picker UI
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
      allowsEditing: true, // Allow cropping/editing
      quality: 1, // Highest quality
    });

    // If user cancels selection, return null
    if (result.canceled) {
      return null;
    }

    // Return the selected image URI
    return result.assets?.[0]?.uri || null;
  }

  /**
   * Sends the selected clothing item to the backend API
   */
  static async saveClothingItem({ photoUri, category, occasion }) {

    // Validate that a photo was selected
    if (!photoUri) {
      throw new Error('Please select a photo first.');
    }

    // Validate that a category was selected
    if (!category) {
      throw new Error('Please select a category.');
    }

    // Validate that an occasion was selected
    if (!occasion) {
      throw new Error('Please select an occasion.');
    }

    // Ensure API URL exists in environment variables
    if (!API_URL) {
      throw new Error('API URL is missing. Check EXPO_PUBLIC_API_URL in your environment.');
    }

    /**
     * Retrieve the logged-in user from AsyncStorage
     * This should have been stored during login
     */
    const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);

    // If no user is found, force login
    if (!storedUser) {
      throw new Error('No logged-in user found. Please log in first.');
    }

    // Convert stored JSON string into a JavaScript object
    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (error) {
      throw new Error('Stored user data is invalid. Please log in again.');
    }

    // Ensure the user object has a valid ID
    if (!parsedUser?.id) {
      throw new Error('Logged-in user ID is missing. Please log in again.');
    }

    /**
     * Create FormData to send multipart/form-data request
     * This is required for file uploads (images)
     */
    const formData = new FormData();

    // Attach user ID (must match a real user in DB)
    formData.append('user_id', String(parsedUser.id));

    // Attach clothing category (e.g., Shirt, Pants)
    formData.append('clothing_type', category);

    // Attach occasion (e.g., Casual, Formal)
    formData.append('occasion', occasion);

    /**
     * Attach the image file
     * - uri: local file path on device
     * - name: file name sent to backend
     * - type: MIME type of the file
     */
    formData.append('image', {
      uri: photoUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    /**
     * Send POST request to backend API
     * - No need to manually set headers (fetch handles FormData)
     */
    const response = await fetch(`${API_URL}/photo-upload`, {
      method: 'POST',
      body: formData,
    });

    // Parse JSON response from backend
    const data = await response.json();

    // If request failed OR backend returned success: false → throw error
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    // Return successful response (contains id, uploaded_at, etc.)
    return data;
  }
}

// Export controller so it can be used in your screens/components
export default PhotoUploadController;