/*
SignUpController.js
for Match-a-Fit

Purpose:
- Validates sign-up form data on the frontend
- Sends the validated data to the backend /signup route
*/

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/*
  Helper class only for validation.
  These methods do not save anything.
  They just check whether the user's input is valid.
*/
class SignUpValidator {
  // Checks whether the email follows a basic email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Checks whether password exists and is at least 8 characters
  static validatePassword(password) {
    if (!password) {
      return { isValid: false, error: 'Password is required.' };
    }
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters.' };
    }
    return { isValid: true, error: null };
  }

  // Checks whether password and confirmPassword match
  static validatePasswordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match.' };
    }
    return { isValid: true, error: null };
  }

  // Checks whether age is present, is a number, and is in a valid range
  static validateAge(age) {
    if (age === null || age === undefined || age === '') {
      return { isValid: false, error: 'Age is required.' };
    }

    // parseInt converts the text input into a real number
    const ageNum = parseInt(age, 10);

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

  // Checks whether gender is one of the allowed options
  static validateGender(gender) {
    if (!gender) {
      return { isValid: false, error: 'Gender is required.' };
    }

    const validGenders = ['male', 'female', 'other'];

    // includes() checks whether gender is inside the array
    if (!validGenders.includes(gender.toLowerCase())) {
      return { isValid: false, error: 'Gender must be: male, female, or other.' };
    }

    return { isValid: true, error: null };
  }
}

/*
  Main controller class.
  This is the file the SignUpScreen talks to.
*/
export class SignUpController {
  static async signUp(formData) {
    try {
      /*
        We store validation errors in this object.
        Example:
        {
          email: "Email is invalid.",
          password: "Password must be at least 8 characters."
        }
      */
      const errors = {};

      // ----- Validate email -----
      if (!formData.email) {
        errors.email = 'Email is required.';
      } else if (!SignUpValidator.validateEmail(formData.email)) {
        errors.email = 'Email is invalid.';
      }

      // ----- Validate password -----
      const passwordCheck = SignUpValidator.validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        errors.password = passwordCheck.error;
      }

      // ----- Validate password match -----
      const matchCheck = SignUpValidator.validatePasswordMatch(
        formData.password,
        formData.confirmPassword
      );
      if (!matchCheck.isValid) {
        errors.confirmPassword = matchCheck.error;
      }

      // ----- Validate age -----
      const ageCheck = SignUpValidator.validateAge(formData.age);
      if (!ageCheck.isValid) {
        errors.age = ageCheck.error;
      }

      // ----- Validate gender -----
      const genderCheck = SignUpValidator.validateGender(formData.gender);
      if (!genderCheck.isValid) {
        errors.gender = genderCheck.error;
      }

      /*
        Object.keys(errors) gives a list of all property names inside errors.
        If length > 0, then at least one error exists.
      */
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          errors,
        };
      }

      /*
        Build the data we want to send to the backend.
        We clean up the values first:
        - email: trim spaces and lowercase it
        - age: convert from text to integer
        - gender: lowercase it
      */
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        age: parseInt(formData.age, 10),
        gender: formData.gender.toLowerCase(),
      };

      /*
        Send a POST request to the backend /signup endpoint.
        fetch() is how the frontend talks to your API.
      */
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // JSON.stringify turns the JavaScript object into JSON text
        body: JSON.stringify(payload),
      });

      // Convert backend response from JSON text into a JavaScript object
      const data = await response.json();

      /*
        If the HTTP response failed OR backend said success is false,
        return the errors back to the screen.
      */
      if (!response.ok || !data.success) {
        return {
          success: false,
          errors: data.errors
            ? Array.isArray(data.errors)
              /*
                If backend returns a list like:
                ["Email is invalid", "Age is required"]
                join them into one message.
              */
              ? { general: data.errors.join('\n') }
              : data.errors
            : { general: data.error || 'Sign up failed.' },
        };
      }

      // If everything worked, return success
      return {
        success: true,
        message: data.message || 'Account created successfully!',
        data: data.data,
      };
    } catch (error) {
      /*
        This catches unexpected errors, such as:
        - backend not running
        - network issue
        - invalid response
      */
      return {
        success: false,
        errors: {
          general: 'Could not connect to the server.',
        },
      };
    }
  }
}