/**
 * Created By: Brianna Mendoza 
 * ProfileScreen.js
 * Purpose:
 * - Handles UI for Profile Screen
 * - Displays and allows editing of the user's profile information
 * - Delegates all backend logic to ProfileScreenController
 */

import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ProfileScreenController } from '../../../Controllers/ProfileScreenController';
import Button from '../Components/Common/Button';
import Loading from '../Components/Common/Loading';

const ProfileScreen = () => {
//Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phnNumber: '',
    email: '',
    age: '',
    gender: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

//UI State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

//Loads Profile on mount
  useEffect(() => {
    ProfileScreenController.loadProfile().then((result) => {
      if (result.success) {
        setFormData(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
      setLoading(false);
    });
  }, []);

//Sends new updated profile changes to controller 
  const onSaveProfile = async () => {
    setLoading(true);
    const result = await ProfileScreenController.updateProfile(formData);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', result.message);
      setIsEditing(false);
    } else {
      Alert.alert('Update Failed', result.message);
    }
  };

//Sends password fields to controller
  const onChangePassword = async () => {
    setLoading(true);
    const result = await ProfileScreenController.changePassword(passwordData);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', result.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } else {
      Alert.alert('Password Update Failed', result.message);
    }
  };

//Delegates logout to controller
  const onLogout = async () => {
    await ProfileScreenController.logout();
  };

  if (loading) return <Loading message="Loading profile..." />;

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
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your Match-a-Fit account</Text>

          {/*Profile Info Section*/}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editToggle}
            >
              <Text style={styles.editToggleText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            placeholder="First name"
            value={formData.firstName}
            onChangeText={(v) => setFormData({ ...formData, firstName: v })}
            editable={isEditing}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            placeholder="Last name"
            value={formData.lastName}
            onChangeText={(v) => setFormData({ ...formData, lastName: v })}
            editable={isEditing}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            placeholder="Phone number"
            value={formData.phnNumber}
            onChangeText={(v) => setFormData({ ...formData, phnNumber: v })}
            editable={isEditing}
            keyboardType="phone-pad"
          />
          
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            placeholder="Email address"
            value={formData.email}
            onChangeText={(v) => setFormData({ ...formData, email: v })}
            editable={isEditing}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            placeholder="Age"
            value={formData.age}
            onChangeText={(v) => setFormData({ ...formData, age: v })}
            editable={isEditing}
            keyboardType="numeric"
          />

            {/*Gender selector, disabled when not editing*/}
          <View style={styles.genderContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderButtons}>
              {['male', 'female', 'other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderButton,
                    formData.gender === g && styles.genderButtonSelected,
                    !isEditing && styles.genderButtonDisabled,
                  ]}
                  onPress={() => isEditing && setFormData({ ...formData, gender: g })}
                  disabled={!isEditing}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === g && styles.genderButtonTextSelected,
                    ]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        {/*Save Button */}
          {isEditing && (
            <Button
              title="Save Changes"
              onPress={onSaveProfile}
              style={styles.saveButton}
            />
          )}

          {/*Divider*/}
          <View style={styles.divider} />

          {/*Change Password Section*/}
          <TouchableOpacity
            onPress={() => setShowPasswordSection(!showPasswordSection)}
            style={styles.passwordToggle}
          >
            <Text style={styles.passwordToggleText}>
              {showPasswordSection ? 'Hide Password Section' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          {/*Toggles password Section (new, current, and confirm password)*/}
          {showPasswordSection && (
            <>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChangeText={(v) =>
                    setPasswordData({ ...passwordData, currentPassword: v })
                  }
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>
                    {showCurrentPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChangeText={(v) =>
                    setPasswordData({ ...passwordData, newPassword: v })
                  }
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
               
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>
                    {showNewPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChangeText={(v) =>
                    setPasswordData({ ...passwordData, confirmPassword: v })
                  }
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
              
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Update Password"
                onPress={onChangePassword}
                style={styles.saveButton}
              />
            </>
          )}

          {/*Logout gets handled by the controller */}
          <TouchableOpacity onPress={onLogout} style={styles.logoutLink}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// UI styles 
const styles = StyleSheet.create({
  container:                { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent:            { flexGrow: 1 },
  content:                  { flex: 1, padding: 20, paddingTop: 60 },
  title:                    { fontSize: 32, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle:                 { fontSize: 16, color: '#666', marginBottom: 30 },
  sectionHeader:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle:             { fontSize: 18, fontWeight: '600', color: '#333' },
  editToggle:               { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#e8f0fe' },
  editToggleText:           { color: '#007AFF', fontWeight: '600', fontSize: 14 },
  label:                    { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8, color: '#333' },
  input:                    { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333', backgroundColor: '#fff' },
  inputDisabled:            { backgroundColor: '#f0f0f0', color: '#888' },
  passwordWrapper:          { width: '100%', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#fff' },
  passwordInput:            { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333' },
  eyeButton:                { paddingHorizontal: 12 },
  eyeText:                  { fontSize: 18 },
  genderContainer:          { marginVertical: 8 },
  genderButtons:            { flexDirection: 'row', justifyContent: 'space-between' },
  genderButton:             { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 4, alignItems: 'center', backgroundColor: '#fff' },
  genderButtonSelected:     { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  genderButtonDisabled:     { backgroundColor: '#f0f0f0' },
  genderButtonText:         { fontSize: 14, color: '#333', fontWeight: '500' },
  genderButtonTextSelected: { color: '#fff', fontWeight: '600' },
  saveButton:               { marginTop: 12 },
  divider:                  { height: 1, backgroundColor: '#e0e0e0', marginVertical: 24 },
  passwordToggle:           { marginBottom: 12 },
  passwordToggleText:       { color: '#007AFF', fontWeight: '600', fontSize: 15 },
  logoutLink:               { alignItems: 'center', marginTop: 32 },
  logoutText:               { fontSize: 14, color: '#FF3B30', fontWeight: '600' },
});

export default ProfileScreen;