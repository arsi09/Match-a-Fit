/* SignUpController2.js
by Juan Marco Saca Dada
for Match-a-Fit
this file contains the logic for the sign up screen, including form validation and handling user input
03/03/2026
*/


import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * SignUpValidator
 * Handles all validation for sign-up form inputs
 */
class SignUpValidator {
  /**
   * Validates email format
   * @param {string} email 
   * @returns {boolean}
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates password is at least 8 characters
   * @param {string} password 
   * @returns {object} { isValid: boolean, error: string }
   */
  static validatePassword(password) {
    if (!password) {
      return { isValid: false, error: 'Password is required.' };
    }
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters.' };
    }
    return { isValid: true, error: null };
  }

  /**
   * Validates that passwords match
   * @param {string} password 
   * @param {string} confirmPassword 
   * @returns {object} { isValid: boolean, error: string }
   */
  static validatePasswordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match.' };
    }
    return { isValid: true, error: null };
  }

  /**
   * Validates age is a valid number >= 13
   * @param {string|number} age 
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateAge(age) {
    if (age === null || age === undefined || age === '') {
      return { isValid: false, error: 'Age is required.' };
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) {
      return { isValid: false, error: 'Age must be a whole number.' };
    }
    if (ageNum < 13) {
      return { isValid: false, error: 'You must be at least 13 years old.' };
    }
    if (ageNum > 120) {
      return { isValid: false, error: 'Please enter a valid age.' };
    }
    return { isValid: true, error: null };
  }

  /**
   * Validates gender is male, female, or other
   * @param {string} gender 
   * @returns {object} { isValid: boolean, error: string }
   */
  static validateGender(gender) {
    if (!gender) {
      return { isValid: false, error: 'Gender is required.' };
    }
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender.toLowerCase())) {
      return { isValid: false, error: 'Gender must be: male, female, or other.' };
    }
    return { isValid: true, error: null };
  }
}

export class SignUpController {
  
  /**
   * Processes sign-up form data
   * Validates all inputs and stores in variables
   * 
   * @param {object} formData - { email, password, confirmPassword, age, gender }
   * @returns {object} { success: boolean, errors?: {}, data?: object }
   */
  static async signUp(formData) {
    try {
      const errors = {};

      // Validate email
      if (!formData.email) {
        errors.email = 'Email is required.';
      } else if (!SignUpValidator.validateEmail(formData.email)) {
        errors.email = 'Email is invalid.';
      }

      // Validate password
      const passwordCheck = SignUpValidator.validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        errors.password = passwordCheck.error;
      }

      // Validate password match
      const matchCheck = SignUpValidator.validatePasswordMatch(
        formData.password,
        formData.confirmPassword
      );
      if (!matchCheck.isValid) {
        errors.confirmPassword = matchCheck.error;
      }

      // Validate age
      const ageCheck = SignUpValidator.validateAge(formData.age);
      if (!ageCheck.isValid) {
        errors.age = ageCheck.error;
      }

      // Validate gender
      const genderCheck = SignUpValidator.validateGender(formData.gender);
      if (!genderCheck.isValid) {
        errors.gender = genderCheck.error;
      }

      // If there are validation errors, return them
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          errors: errors
        };
      }

      // Store validated data in variables
      const signUpData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        age: parseInt(formData.age),
        gender: formData.gender.toLowerCase()
      };

      console.log('Sign-up validation successful. Data ready for backend:', signUpData);

      return {
        success: true,
        data: signUpData
      };

    } catch (error) {
      console.error('SignUp error:', error);
      return {
        success: false,
        errors: { general: error.message || 'An unexpected error occurred.' }
      };
    }
  }
}