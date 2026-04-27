import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ProfileController from "../../../Controllers/ProfileController";
import Button from "../Components/Common/Button";
import Loading from "../Components/Common/Loading";

const ProfileScreen = () => {
  // Stores the profile data shown on the main profile screen.
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phnNumber: "",
    email: "",
    age: "",
    gender: "",
  });

  // Stores temporary profile edits inside the edit profile modal.
  const [editData, setEditData] = useState(formData);

  // Stores temporary password input inside the change password modal.
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Controls modal visibility.
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Controls password visibility.
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Controls loading screen.
  const [loading, setLoading] = useState(true);

  // Loads the user profile when the screen first opens.
  useEffect(() => {
    ProfileController.loadProfile().then((result) => {
      if (result.success) {
        setFormData(result.data);
        setEditData(result.data);
      } else {
        Alert.alert("Error", result.message);
      }

      setLoading(false);
    });
  }, []);

  // Opens the edit profile modal and copies the current profile into editData.
  const openEditModal = () => {
    setEditData(formData);
    setShowEditModal(true);
  };

  // Opens the password modal and clears old password inputs.
  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordModal(true);
  };

  // Saves edited profile data through ProfileController.
  const onSaveProfile = async () => {
    setLoading(true);

    const result = await ProfileController.updateProfile(editData);

    setLoading(false);

    if (result.success) {
      setFormData(result.data);
      setEditData(result.data);
      setShowEditModal(false);
      Alert.alert("Success", result.message);
    } else {
      Alert.alert("Update Failed", result.message);
    }
  };

  // Sends password change request through ProfileController.
  const onChangePassword = async () => {
    setLoading(true);

    const result = await ProfileController.changePassword(passwordData);

    setLoading(false);

    if (result.success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordModal(false);
      Alert.alert("Success", result.message);
    } else {
      Alert.alert("Password Update Failed", result.message);
    }
  };

  // Logs the user out.
  const onLogout = async () => {
    const result = await ProfileController.logout();

    if (result.success) {
      router.replace("/");
    } else {
      Alert.alert("Logout Failed", result.message);
    }
  };

  // Reusable row for showing profile information as text.
  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Not provided"}</Text>
    </View>
  );

  if (loading) return <Loading message="Loading profile..." />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile icon and name */}
        <View style={styles.profileIconContainer}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>👤</Text>
          </View>

          <Text style={styles.nameText}>
            {formData.firstName} {formData.lastName}
          </Text>

          <Text style={styles.subtitle}>Manage your Match-a-Fit account</Text>
        </View>

        {/* Profile information card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>

            <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <InfoRow label="First Name" value={formData.firstName} />
          <InfoRow label="Last Name" value={formData.lastName} />
          <InfoRow label="Phone Number" value={formData.phnNumber} />
          <InfoRow label="Email" value={formData.email} />
          <InfoRow label="Age" value={formData.age} />
          <InfoRow label="Gender" value={formData.gender} />
        </View>

        {/* Change password card */}
        <View style={styles.card}>
          <TouchableOpacity
            onPress={openPasswordModal}
            style={styles.passwordButton}
          >
            <Text style={styles.passwordButtonText}>🔒 Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Logout button */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.firstName}
                  onChangeText={(v) =>
                    setEditData({ ...editData, firstName: v })
                  }
                  placeholder="First name"
                />

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.lastName}
                  onChangeText={(v) =>
                    setEditData({ ...editData, lastName: v })
                  }
                  placeholder="Last name"
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editData.phnNumber}
                  onChangeText={(v) =>
                    setEditData({ ...editData, phnNumber: v })
                  }
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editData.email}
                  onChangeText={(v) => setEditData({ ...editData, email: v })}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={editData.age}
                  onChangeText={(v) => setEditData({ ...editData, age: v })}
                  placeholder="Age"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderButtons}>
                  {["male", "female", "other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderButton,
                        editData.gender === g && styles.genderButtonSelected,
                      ]}
                      onPress={() => setEditData({ ...editData, gender: g })}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          editData.gender === g &&
                            styles.genderButtonTextSelected,
                        ]}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <Button
                    title="Save"
                    onPress={onSaveProfile}
                    style={styles.saveButton}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Change password modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Change Password</Text>

              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.currentPassword}
                    onChangeText={(v) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: v,
                      })
                    }
                    placeholder="Enter current password"
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeText}>
                      {showCurrentPassword ? "🙈" : "👁️"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.newPassword}
                    onChangeText={(v) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: v,
                      })
                    }
                    placeholder="Enter new password"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeText}>
                      {showNewPassword ? "🙈" : "👁️"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.confirmPassword}
                    onChangeText={(v) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: v,
                      })
                    }
                    placeholder="Confirm new password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeText}>
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowPasswordModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <Button
                    title="Update Password"
                    onPress={onChangePassword}
                    style={styles.saveButton}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerSpacer: {
    width: 50,
  },
  scrollContent: {
    padding: 16,
  },
  profileIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileIcon: {
    width: 85,
    height: 85,
    backgroundColor: "#42A5F5",
    borderRadius: 43,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileIconText: {
    fontSize: 42,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  editButton: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#1976D2",
    fontWeight: "700",
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  passwordButton: {
    paddingVertical: 4,
  },
  passwordButtonText: {
    color: "#1976D2",
    fontWeight: "700",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF3B30",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 18,
  },
  modalKeyboard: {
    flex: 1,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 14,
    color: "#333",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  passwordWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  eyeText: {
    fontSize: 18,
  },
  genderButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  genderButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  genderButtonSelected: {
    backgroundColor: "#42A5F5",
    borderColor: "#42A5F5",
  },
  genderButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  genderButtonTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  modalButtons: {
    marginTop: 18,
  },
  cancelButton: {
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  cancelButtonText: {
    color: "#555",
    fontWeight: "700",
  },
  saveButton: {
    marginTop: 0,
  },
});

export default ProfileScreen;