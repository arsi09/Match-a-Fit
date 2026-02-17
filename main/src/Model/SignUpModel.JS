/*
 SignUpModel.js
 Frontend model for the Sign Up form in Match-a-Fit
 - performs validation and prepares the payload sent to the controller/service
 - intended for use by `SignUpScreen.JS`
*/

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const ALLOWED_GENDERS = ['male', 'female', 'other'];

export default class SignUpModel {
  constructor({ email = '', password = '', confirmPassword = '', age = '', gender = '' } = {}) {
    this.email = (email || '').trim();
    this.password = password || '';
    this.confirmPassword = confirmPassword || '';
    this.age = age;
    this.gender = (gender || '').toLowerCase();
  }

  /**
   * Validate the model fields and return result with error messages.
   * @returns {{valid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];

    // email
    if (!this.email) {
      errors.push('Email is required.');
    } else if (!EMAIL_REGEX.test(this.email)) {
      errors.push('Email is invalid.');
    }

    // password
    if (!this.password) {
      errors.push('Password is required.');
    } else if (this.password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
    }

    // confirm password
    if (this.password !== this.confirmPassword) {
      errors.push('Passwords do not match.');
    }

    // age
    if (this.age === '' || this.age === null || this.age === undefined) {
      errors.push('Age is required.');
    } else {
      const ageNumber = Number(this.age);
      if (Number.isNaN(ageNumber) || !Number.isInteger(ageNumber)) {
        errors.push('Age must be a whole number.');
      } else if (ageNumber < 13) {
        errors.push('You must be at least 13 years old.');
      }
    }

    // gender
    if (!this.gender) {
      errors.push('Gender is required.');
    } else if (!ALLOWED_GENDERS.includes(this.gender)) {
      errors.push('Gender must be one of: male, female, other.');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Prepare payload to send to backend/controller.
   * confirmPassword is intentionally omitted (not needed server-side).
   */
  toPayload() {
    const ageNumber = Number(this.age);
    return {
      email: this.email,
      password: this.password,
      age: Number.isNaN(ageNumber) ? null : ageNumber,
      gender: this.gender,
    };
  }

  static fromForm(values) {
    return new SignUpModel(values);
  }
}
