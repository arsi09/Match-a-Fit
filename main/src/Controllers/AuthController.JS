import { User } from '../models/User';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthController {
  static async signUp(userData) {
    try {
      if (!User.validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }
      if (!User.validatePassword(userData.password)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
      }
      if (!User.validateAge(userData.age)) {
        throw new Error('Age must be between 13 and 120');
      }
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const user = new User(userData);
      const response = await authService.register(user.toJSON(), userData.password);

      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userId', response.user.id.toString());

      return {
        success: true,
        user: new User(response.user),
        message: 'Account created successfully',
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async login(email, password) {
    try {
      if (!User.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (!password) {
        throw new Error('Password is required');
      }

      const response = await authService.login(email, password);

      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userId', response.user.id.toString());

      return {
        success: true,
        user: new User(response.user),
        message: 'Login successful',
      };
    } catch (error) {
      return { success: false, error: error.message || 'Invalid credentials' };
    }
  }

  static async logout() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to logout' };
    }
  }
}