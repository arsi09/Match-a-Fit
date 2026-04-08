import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SignUpController } from '../../../Controllers/SignUpController';
import Button from '../Components/Common/Button';
import Input from '../Components/Common/Input';
import Loading from '../Components/Common/Loading';

/*
  This is the screen component the user sees.
  It collects input and sends it to the controller.
*/
const SignUpScreen = () => {
  // useState creates variables that React watches for changes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  /*
    This function runs when the user presses the Sign Up button.
    It calls the controller and then shows success or error messages.
  */
  const handleSignUp = async () => {
    // Show loading spinner
    setLoading(true);

    // Send current form values to the controller
    const result = await SignUpController.signUp({
      email,
      password,
      confirmPassword,
      age,
      gender,
    });

    // Stop loading spinner
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Success!',
        result.message || 'Account created successfully!',
        [
          {
            text: 'OK',
            // Go back to login screen after successful sign up
            onPress: () => router.push('/'),
          },
        ]
      );
    } else {
      /*
        Object.values(result.errors || {}) gets all error messages
        from the errors object and turns them into an array.

        join('\n') puts each error on a new line.
      */
      Alert.alert(
        'Sign Up Failed',
        Object.values(result.errors || {}).join('\n') || 'Something went wrong.'
      );
    }
  };

  // Updates selected gender when user presses a gender button
  const selectGender = (selectedGender) => {
    setGender(selectedGender);
  };

  /*
    If loading is true, show the Loading component instead of the form.
    This prevents user from pressing buttons while request is being processed.
  */
  if (loading) {
    return <Loading message="Creating your account..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // On iPhone, push content up when keyboard appears
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up for Match-a-Fit</Text>

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Input
            label="Age"
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <View style={styles.genderContainer}>
            <Text style={styles.label}>Gender</Text>

            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  // If current gender is male, add selected style too
                  gender === 'male' && styles.genderButtonSelected,
                ]}
                onPress={() => selectGender('male')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.genderButtonTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonSelected,
                ]}
                onPress={() => selectGender('female')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.genderButtonTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'other' && styles.genderButtonSelected,
                ]}
                onPress={() => selectGender('other')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'other' && styles.genderButtonTextSelected,
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Sign Up"
            onPress={handleSignUp}
            style={styles.signUpButton}
          />

          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginTextBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  genderContainer: {
    marginVertical: 8,
  },
  genderButtons: {
    // Put gender buttons side by side
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  genderButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  signUpButton: {
    marginTop: 20,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default SignUpScreen;