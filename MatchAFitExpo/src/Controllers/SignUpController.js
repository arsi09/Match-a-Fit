// ============================================================================
// AuthController.js
// Purpose: Handles authentication operations (signup, login, logout)
//          including validation, token management, and error handling
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User Model - Simple user data structure with validation methods
 */
class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phoneNumber = data.phoneNumber || '';
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
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      age: this.age,
      gender: this.gender,
    };
  }
}

/**
 * AuthController
 * Manages user authentication workflows including account creation, login, and logout.
 * All methods are static and return standardized response objects with success status.
 */
export class AuthController {
  /**
   * signUp - Creates a new user account with validation
   * 
   * Process:
   * 1. Validates first name is provided
   * 2. Validates last name is provided
   * 3. Validates email format using User model validator
   * 4. Validates phone number format
   * 5. Validates password strength (min 8 chars, requires uppercase, lowercase, number)
   * 6. Validates age is between 13-120
   * 7. Confirms both password fields match
   * 8. Creates new User instance from input data
   * 9. Registers user via mock backend (stores in AsyncStorage)
   * 10. Stores authentication token and user ID in device storage
   * 
   * @param {Object} userData - User registration data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email address
   * @param {string} userData.phoneNumber - User's phone number
   * @param {string} userData.password - User's password (must meet strength requirements)
   * @param {string} userData.confirmPassword - Password confirmation (must match password)
   * @param {number} userData.age - User's age (13-120 valid range)
   * @param {string} userData.gender - User's gender
   * @returns {Object} Response object with success boolean, user instance, and message/error
   */
  static async signUp(userData) {
    try {
      // Validate first name is provided
      if (!userData.firstName || userData.firstName.trim().length === 0) {
        throw new Error('First name is required');
      }

      // Validate last name is provided
      if (!userData.lastName || userData.lastName.trim().length === 0) {
        throw new Error('Last name is required');
      }

      // Validate email format
      if (!User.validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate phone number format (basic validation - at least 10 digits)
      const phoneDigits = userData.phoneNumber.replace(/\D/g, '');
      if (!userData.phoneNumber || phoneDigits.length < 10) {
        throw new Error('Please enter a valid phone number (at least 10 digits)');
      }
      
      // Validate password meets strength requirements
      if (!User.validatePassword(userData.password)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
      }
      
      // Validate age is within acceptable range
      if (!User.validateAge(userData.age)) {
        throw new Error('Age must be between 13 and 120');
      }
      
      // Ensure password confirmation matches password field
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Create User instance with validated data
      const user = new User({
        ...userData,
        id: Date.now(), // Mock ID for now
      });

      // Mock backend response - In production, this would call authService.register()
      const mockUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        age: user.age,
        gender: user.gender,
      };

      // Store authentication token in device storage for future API requests
      await AsyncStorage.setItem('authToken', 'mock-token-' + mockUser.id);
      
      // Store user ID for reference in other operations
      await AsyncStorage.setItem('userId', mockUser.id.toString());

      // Store full user data
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));

      // Return success response with newly created user object
      return {
        success: true,
        user: new User(mockUser),
        message: 'Account created successfully!',
      };
    } catch (error) {
      // Return error details if any validation or registration fails
      return { success: false, error: error.message };
    }
  }

  /**
   * login - Authenticates user with email and password
   * 
   * Process:
   * 1. Validates email format
   * 2. Ensures password is provided
   * 3. Calls authService API to authenticate credentials
   * 4. Stores authentication token and user ID if successful
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} Response object with success boolean, user instance, and message/error
   */
  static async login(email, password) {
    try {
      // Validate email format before sending to server
      if (!User.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      // Ensure password field is not empty
      if (!password) {
        throw new Error('Password is required');
      }

      // Mock login - In production, this would call authService.login()
      const mockUser = {
        id: Date.now(),
        firstName: 'Test',
        lastName: 'User',
        email: email,
        phoneNumber: '1234567890',
        age: 25,
        gender: 'other',
      };

      // Store authentication token for authenticated API requests
      await AsyncStorage.setItem('authToken', 'mock-token-' + mockUser.id);
      
      // Store user ID for reference
      await AsyncStorage.setItem('userId', mockUser.id.toString());

      // Store full user data
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));

      // Return success response with authenticated user object
      return {
        success: true,
        user: new User(mockUser),
        message: 'Login successful',
      };
    } catch (error) {
      // Return error (defaults to generic message if specific error unavailable)
      return { success: false, error: error.message || 'Invalid credentials' };
    }
  }

  /**
   * logout - Clears user authentication from device storage
   * 
   * Process:
   * 1. Removes authentication token from device storage
   * 2. Removes user ID from device storage
   * 3. Removes user data from device storage
   * 4. Returns success status
   * 
   * @returns {Object} Response object with success boolean and error if logout fails
   */
  static async logout() {
    try {
      // Remove authentication token to invalidate session
      await AsyncStorage.removeItem('authToken');
      
      // Remove stored user ID
      await AsyncStorage.removeItem('userId');

      // Remove stored user data
      await AsyncStorage.removeItem('userData');
      
      // Return success confirmation
      return { success: true };
    } catch (error) {
      // Return error if storage operation fails
      return { success: false, error: 'Failed to logout' };
    }
  }

  /**
   * getCurrentUser - Retrieves the currently logged in user from storage
   * 
   * @returns {Object|null} User object if logged in, null otherwise
   */
  static async getCurrentUser() {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return null;
      
      const userData = JSON.parse(userDataString);
      return new User(userData);
    } catch (error) {
      return null;
    }
  }
}