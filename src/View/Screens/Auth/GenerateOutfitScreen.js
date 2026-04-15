// Import React hooks for state and side effects
import { useState } from "react";

// Import React Native components used in this screen
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import Expo Router so the Back button can return to the previous screen
import { router } from "expo-router";

// Main screen component for outfit generation
const GenerateOutfitScreen = () => {
  // step controls which part of the screen is shown
  // "selection" = user is choosing options
  // "generating" = loading screen while outfit is being created
  const [step, setStep] = useState("selection");

  // Stores the selected occasion
  const [occasion, setOccasion] = useState("");

  // Stores the selected time of day
  const [timeOfDay, setTimeOfDay] = useState("");

  // Handles the Generate Outfit button
  const handleGenerate = async () => {
    // Prevent the user from continuing if they did not choose both options
    if (!occasion || !timeOfDay) {
      Alert.alert(
        "Missing Information",
        "Please select both occasion and time of day"
      );
      return;
    }

    // Show the loading/generating view
    setStep("generating");

    // Placeholder logic until the real controller is connected
    // After 2.5 seconds it shows a message and returns to selection
    setTimeout(() => {
      Alert.alert(
        "Coming Soon!",
        "Outfit generation will be implemented by the controller team. They will:\n\n1. Fetch your uploaded clothes\n2. Use AI to match items\n3. Return a complete outfit",
        [
          {
            text: "OK",
            onPress: () => setStep("selection"),
          },
        ]
      );
    }, 2500);
  };

  // Converts text like "Business Casual" into "business-casual"
  // This makes it easier to store a clean value in state
  const formatOccasionValue = (value) => {
    return value.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Back button returns to the previous screen */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Screen title */}
          <Text style={styles.headerTitle}>Generate Outfit</Text>
        </View>
      </View>

      {/* Main scrollable content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          {/* Selection screen shown before generating */}
          {step === "selection" && (
            <View>
              {/* Top section of the card */}
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>✨</Text>
                </View>

                <Text style={styles.cardTitle}>Create Your Perfect Outfit</Text>
                <Text style={styles.cardSubtitle}>
                  Tell us about your event
                </Text>
              </View>

              {/* Form area where the user makes selections */}
              <View style={styles.formSection}>
                {/* Occasion label */}
                <Text style={styles.sectionLabel}>Type of Occasion</Text>

                {/* Occasion buttons */}
                <View style={styles.buttonGrid3}>
                  {["Casual", "Business Casual", "Formal"].map((occ) => {
                    const value = formatOccasionValue(occ);

                    return (
                      <TouchableOpacity
                        key={occ}
                        onPress={() => setOccasion(value)}
                        style={[
                          styles.optionButton,
                          styles.optionButtonThird,
                          occasion === value && styles.optionButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            occasion === value &&
                              styles.optionButtonTextSelected,
                          ]}
                        >
                          {occ}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Time of day label */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                  Time of Day
                </Text>

                {/* Time of day buttons */}
                <View style={styles.buttonGrid2}>
                  {["Morning", "Noon", "Afternoon", "Evening"].map((time) => {
                    const value = time.toLowerCase();

                    return (
                      <TouchableOpacity
                        key={time}
                        onPress={() => setTimeOfDay(value)}
                        style={[
                          styles.optionButton,
                          styles.optionButtonHalf,
                          timeOfDay === value && styles.optionButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            timeOfDay === value &&
                              styles.optionButtonTextSelected,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Generate button becomes disabled until both fields are chosen */}
                <TouchableOpacity
                  onPress={handleGenerate}
                  disabled={!occasion || !timeOfDay}
                  style={[
                    styles.generateButton,
                    (!occasion || !timeOfDay) && styles.generateButtonDisabled,
                  ]}
                >
                  <Text style={styles.generateButtonText}>
                    Generate Outfit ✨
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Loading screen shown while "generating" */}
          {step === "generating" && (
            <View style={styles.generatingContainer}>
              {/* Spinner animation */}
              <ActivityIndicator
                size="large"
                color="#42A5F5"
                style={styles.loader}
              />

              {/* Main loading text */}
              <Text style={styles.generatingTitle}>
                Generating Your Outfit...
              </Text>

              {/* Smaller subtitle */}
              <Text style={styles.generatingSubtitle}>
                Our AI is selecting the perfect combination
              </Text>

              {/* Fake progress checklist */}
              <View style={styles.statusList}>
                <Text style={styles.statusItem}>✓ Analyzing your closet</Text>
                <Text style={styles.statusItem}>
                  ✓ Matching colors and styles
                </Text>
                <Text style={styles.statusItem}>✓ Building your outfit</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for the screen
const styles = StyleSheet.create({
  // Main background container
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD",
  },

  // Top header bar
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Left side of header containing back button and title
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  // Back button spacing
  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
    marginRight: 8,
  },

  // Back button text styling
  backButtonText: {
    color: "#666",
    fontSize: 16,
  },

  // Header title styling
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  // ScrollView styling
  content: {
    flex: 1,
  },

  // Padding for scroll content
  contentContainer: {
    padding: 16,
  },

  // Main white card
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // Top card content alignment
  cardHeader: {
    alignItems: "center",
    marginBottom: 32,
  },

  // Blue circle icon background
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#42A5F5",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  // Sparkle icon style
  iconText: {
    fontSize: 40,
  },

  // Main card title
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },

  // Smaller card subtitle
  cardSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // Form layout spacing
  formSection: {
    gap: 16,
  },

  // Section labels
  sectionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },

  // Occasion row
  buttonGrid3: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  // Time row
  buttonGrid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  // Base style for selection buttons
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },

  // One-third width button for occasion row
  optionButtonThird: {
    width: "31%",
    minWidth: 180,
  },

  // Half width button for time row
  optionButtonHalf: {
    width: "48%",
    minWidth: 220,
  },

  // Style added when an option is selected
  optionButtonSelected: {
    borderColor: "#42A5F5",
    backgroundColor: "#E3F2FD",
  },

  // Button text
  optionButtonText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },

  // Selected button text
  optionButtonTextSelected: {
    color: "#1976D2",
    fontWeight: "600",
  },

  // Main generate button
  generateButton: {
    backgroundColor: "#42A5F5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#42A5F5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Disabled state for generate button
  generateButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },

  // Generate button text
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Layout for loading screen
  generatingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },

  // Extra space under loading spinner
  loader: {
    marginBottom: 24,
  },

  // Loading title
  generatingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },

  // Loading subtitle
  generatingSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },

  // List of status messages
  statusList: {
    gap: 8,
  },

  // Single status line
  statusItem: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

// Export the screen so it can be used by the app
export default GenerateOutfitScreen;