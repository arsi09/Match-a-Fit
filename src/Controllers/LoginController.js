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

      console.log('=== LOGIN START ===');
      console.log('API_URL:', API_URL);
      console.log('Credentials being sent:', credentials);

      if (!credentials.email || !credentials.password) {
        console.log('Missing email or password');
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
      console.log('Response data:', data);

      if (!response.ok || !data.success) {
        console.log('Login failed on backend');
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      console.log('Login succeeded, saving user...');
      console.log('User object:', data.user);

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