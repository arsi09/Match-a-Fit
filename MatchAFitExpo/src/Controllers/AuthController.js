import AsyncStorage from '@react-native-async-storage/async-storage';

class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.age = data.age || null;
    this.gender = data.gender || '';
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  }

  static validateAge(age) {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 13 && ageNum <= 120;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      age: this.age,
      gender: this.gender,
    };
  }
}

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

      // Mock response since we don't have backend yet
      const mockUser = {
        id: Date.now(),
        email: userData.email,
        age: userData.age,
        gender: userData.gender,
      };

      await AsyncStorage.setItem('authToken', 'mock-token-' + mockUser.id);
      await AsyncStorage.setItem('userId', mockUser.id.toString());

      return {
        success: true,
        user: new User(mockUser),
        message: 'Account created successfully!',
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
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

      // Mock response
      const mockUser = {
        id: Date.now(),
        email: email,
      };

      await AsyncStorage.setItem('authToken', 'mock-token-' + mockUser.id);
      await AsyncStorage.setItem('userId', mockUser.id.toString());

      return {
        success: true,
        user: new User(mockUser),
        message: 'Login successful',
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Invalid credentials' 
      };
    }
  }

  static async logout() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to logout' 
      };
    }
  }
}