import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HomeController } from '../../../Controllers/HomeController';

const HomeView = () => {
  const [userName, setUserName] = useState('User');
  const [error, setError] = useState('');

  // Load the user's display name from AsyncStorage through the controller
  useEffect(() => {
    const loadUserName = async () => {
      const displayName = await HomeController.getDisplayName();
      setUserName(displayName);
    };

    loadUserName();
  }, []);

  // Show any controller error in an alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      setError('');
    }
  }, [error]);

  // These are the button functions connected to the controller
  const bindings = HomeController.createBindings();

  // If a controller action fails, show the message to the user
  const handleActionResult = (result) => {
    if (result && result.success === false) {
      Alert.alert(result.title || 'Error', result.message || 'Something went wrong.');
    }
  };

  // Logout button function
  const handleLogout = async () => {
    const result = await HomeController.handleLogoutFromScreen({
      setError,
    });

    if (result && !result.success) {
      Alert.alert('Logout Error', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match-a-Fit</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => handleActionResult(bindings.onOpenProfile())}
          >
            <Text style={styles.profileButtonText}>
              👤 {userName}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome back, {userName}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            What would you like to do today?
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Upload Photo Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardBlue]}
            onPress={() => handleActionResult(bindings.onOpenUploadPhoto())}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📷</Text>
            </View>
            <Text style={styles.cardTitle}>Upload Photo</Text>
            <Text style={styles.cardDescription}>
              Add new clothing items to your virtual closet
            </Text>
          </TouchableOpacity>

          {/* View Closet Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardCyan]}
            onPress={() => handleActionResult(bindings.onOpenCloset())}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>👕</Text>
            </View>
            <Text style={styles.cardTitle}>View Closet</Text>
            <Text style={styles.cardDescription}>
              Browse and manage all your clothing items
            </Text>
          </TouchableOpacity>

          {/* Generate Outfit Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardLightBlue]}
            onPress={() => handleActionResult(bindings.onOpenGenerateOutfit())}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>✨</Text>
            </View>
            <Text style={styles.cardTitle}>Generate Outfit</Text>
            <Text style={styles.cardDescription}>
              Create AI-powered outfit combinations
            </Text>
          </TouchableOpacity>

          {/* Outfit Library Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardSky]}
            onPress={() => handleActionResult(bindings.onOpenOutfitLibrary())}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📚</Text>
            </View>
            <Text style={styles.cardTitle}>Outfit Library</Text>
            <Text style={styles.cardDescription}>
              View and manage your saved outfits
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  profileButton: {
    backgroundColor: '#BBDEFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  profileButtonText: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#EF5350',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 48,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  cardCyan: {
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  cardLightBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#42A5F5',
  },
  cardSky: {
    borderLeftWidth: 4,
    borderLeftColor: '#03A9F4',
  },
  cardIconText: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeView;