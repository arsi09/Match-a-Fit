import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView, 
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import AuthService from '../../Services/AuthService';
import SignUpModel from '../../../Model/SignUpModel.py';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // validate on the client using SignUpModel
    const model = SignUpModel.fromForm({ email, password, confirmPassword, age, gender });
    const { valid, errors } = model.validate();

    if (!valid) {
      Alert.alert('Invalid input', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.signUp(model.toPayload());
      setLoading(false);

      if (result && result.success) {
        Alert.alert('Success!', result.message, [{ text: 'OK', onPress: () => console.log('Account created!') }]);
      } else {
        Alert.alert('Sign Up Failed', (result && result.error) || 'Unknown error');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Sign Up Failed', err.message || 'Unexpected error');
    }
  };

  const selectGender = (selectedGender) => {
    setGender(selectedGender);
  };

  if (loading) {
    return <Loading message="Creating your account..." />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
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
                  gender === 'male' && styles.genderButtonSelected
                ]}
                onPress={() => selectGender('male')}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'male' && styles.genderButtonTextSelected
                ]}>
                  Male
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonSelected
                ]}
                onPress={() => selectGender('female')}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'female' && styles.genderButtonTextSelected
                ]}>
                  Female
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'other' && styles.genderButtonSelected
                ]}
                onPress={() => selectGender('other')}
              >
                <Text style={[
                  styles.genderButtonText,
                  gender === 'other' && styles.genderButtonTextSelected
                ]}>
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
            onPress={() => console.log('Go to login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Log In</Text>
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