// ============================================================================
// SignUpController.JS
// Purpose: Handles authentication operations (signup, login, logout)
//          including validation, token management, and error handling
// ============================================================================

import { User } from '../models/User';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
   * 1. Validates email format using User model validator
   * 2. Validates password strength (min 8 chars, requires uppercase, lowercase, number)
   * 3. Validates age is between 13-120
   * 4. Confirms both password fields match
   * 5. Creates new User instance from input data
   * 6. Registers user via authService API call
   * 7. Stores authentication token and user ID in device storage
   * 
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's password (must meet strength requirements)
   * @param {string} userData.confirmPassword - Password confirmation (must match password)
   * @param {number} userData.age - User's age (13-120 valid range)
   * @returns {Object} Response object with success boolean, user instance, and message/error
   */
  static async signUp(userData) {
    try {
      // Validate email format
      if (!User.validateEmail(userData.email)) {
        throw new Error('Invalid email format');
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
      const user = new User(userData);
      
      // Call backend API to register user and receive auth token
      const response = await authService.register(user.toJSON(), userData.password);

      // Store authentication token in device storage for future API requests
      await AsyncStorage.setItem('authToken', response.token);
      
      // Store user ID for reference in other operations
      await AsyncStorage.setItem('userId', response.user.id.toString());

      // Return success response with newly created user object
      return {
        success: true,
        user: new User(response.user),
        message: 'Account created successfully',
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

      // Call backend API to authenticate user credentials
      const response = await authService.login(email, password);

      // Store authentication token for authenticated API requests
      await AsyncStorage.setItem('authToken', response.token);
      
      // Store user ID for reference
      await AsyncStorage.setItem('userId', response.user.id.toString());

      // Return success response with authenticated user object
      return {
        success: true,
        user: new User(response.user),
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
   * 3. Returns success status
   * 
   * @returns {Object} Response object with success boolean and error if logout fails
   */
  static async logout() {
    try {
      // Remove authentication token to invalidate session
      await AsyncStorage.removeItem('authToken');
      
      // Remove stored user ID
      await AsyncStorage.removeItem('userId');
      
      // Return success confirmation
      return { success: true };
    } catch (error) {
      // Return error if storage operation fails
      return { success: false, error: 'Failed to logout' };
    }
  }
}