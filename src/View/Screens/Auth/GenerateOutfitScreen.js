import { router } from "expo-router";
import { useState } from "react";
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
import GenerateOutfitController from "../../../Controllers/GenerateOutfitController";

const GenerateOutfitScreen = () => {
  const [step, setStep] = useState("selection");
  const [occasion, setOccasion] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [generatedOutfits, setGeneratedOutfits] = useState([]);

  const handleGenerate = async () => {
    if (!occasion || !timeOfDay) {
      Alert.alert(
        "Missing Information",
        "Please select both occasion and time of day"
      );
      return;
    }

    setStep("generating");

    // You can later replace this with real weather data if you want.
    const weatherText = `Time of day: ${timeOfDay}`;

    const result = await GenerateOutfitController.generateOutfit({
      occasion,
      weather: weatherText,
    });

    if (!result.success) {
      setStep("selection");
      Alert.alert("Error", result.error || "Failed to generate outfit");
      return;
    }

    setGeneratedOutfits(result.outfits || []);
    setStep("results");
  };

  const formatOccasionValue = (value) => {
    return value.toLowerCase().replace(/\s+/g, " ");
  };

  const resetGenerator = () => {
    setGeneratedOutfits([]);
    setStep("selection");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Generate Outfit</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          {step === "selection" && (
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>✨</Text>
                </View>

                <Text style={styles.cardTitle}>Create Your Perfect Outfit</Text>
                <Text style={styles.cardSubtitle}>
                  Tell us about your event
                </Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Type of Occasion</Text>

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

                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                  Time of Day
                </Text>

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

          {step === "generating" && (
            <View style={styles.generatingContainer}>
              <ActivityIndicator
                size="large"
                color="#42A5F5"
                style={styles.loader}
              />

              <Text style={styles.generatingTitle}>
                Generating Your Outfit...
              </Text>

              <Text style={styles.generatingSubtitle}>
                Our AI is selecting the perfect combination
              </Text>

              <View style={styles.statusList}>
                <Text style={styles.statusItem}>✓ Analyzing your closet</Text>
                <Text style={styles.statusItem}>
                  ✓ Matching colors and styles
                </Text>
                <Text style={styles.statusItem}>✓ Building your outfit</Text>
              </View>
            </View>
          )}

          {step === "results" && (
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>👗</Text>
                </View>

                <Text style={styles.cardTitle}>Your Outfit Results</Text>
                <Text style={styles.cardSubtitle}>
                  Here are your generated outfit ideas
                </Text>
              </View>

              {generatedOutfits.length === 0 ? (
                <Text style={styles.emptyText}>
                  No outfits were returned by the AI.
                </Text>
              ) : (
                generatedOutfits.map((outfit, index) => (
                  <View key={index} style={styles.resultCard}>
                    <Text style={styles.resultTitle}>
                      {outfit.outfit_name || `Outfit ${index + 1}`}
                    </Text>

                    <Text style={styles.resultLabel}>Items:</Text>
                    <Text style={styles.resultText}>
                      {Array.isArray(outfit.item_ids)
                        ? outfit.item_ids.join(", ")
                        : "No item IDs returned"}
                    </Text>

                    <Text style={styles.resultLabel}>Why it works:</Text>
                    <Text style={styles.resultText}>
                      {outfit.explanation || "No explanation provided"}
                    </Text>

                    <Text style={styles.resultLabel}>Style tip:</Text>
                    <Text style={styles.resultText}>
                      {outfit.style_tip || "No style tip provided"}
                    </Text>
                  </View>
                ))
              )}

              <TouchableOpacity
                onPress={resetGenerator}
                style={styles.generateButton}
              >
                <Text style={styles.generateButtonText}>Generate Another</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
    marginRight: 8,
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

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
  },

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

  cardHeader: {
    alignItems: "center",
    marginBottom: 32,
  },

  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#42A5F5",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  iconText: {
    fontSize: 40,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },

  cardSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  formSection: {
    gap: 16,
  },

  sectionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },

  buttonGrid3: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  buttonGrid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },

  optionButtonThird: {
    width: "31%",
    minWidth: 180,
  },

  optionButtonHalf: {
    width: "48%",
    minWidth: 220,
  },

  optionButtonSelected: {
    borderColor: "#42A5F5",
    backgroundColor: "#E3F2FD",
  },

  optionButtonText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },

  optionButtonTextSelected: {
    color: "#1976D2",
    fontWeight: "600",
  },

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

  generateButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },

  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  generatingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },

  loader: {
    marginBottom: 24,
  },

  generatingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },

  generatingSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },

  statusList: {
    gap: 8,
  },

  statusItem: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

  resultCard: {
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#D6EAF8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 12,
  },

  resultLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },

  resultText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 15,
    marginBottom: 16,
  },
});

export default GenerateOutfitScreen;