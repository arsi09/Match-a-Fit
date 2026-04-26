import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_USER_KEY = 'matchafit_currentUser';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

class LoginController {
  static normalizeCredentials(email, password) {
    return {
      email: String(email || '').trim().toLowerCase(),
      password: String(password || ''),
    };
  }

  static async login(email, password) {
    try {
      const credentials = this.normalizeCredentials(email, password);


      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      

      if (!response.ok || !data.success) {
        
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));

      console.log('User saved successfully');

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.log('LOGIN ERROR:', error);
      return {
        success: false,
        error: 'Could not connect to the server.',
      };
    }
  }
}

export default LoginController;