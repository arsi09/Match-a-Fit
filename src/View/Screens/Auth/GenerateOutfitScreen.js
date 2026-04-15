import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const GenerateOutfitScreen = ({ navigation = null }) => {
  const [step, setStep] = useState("selection"); // 'selection' | 'generating' | 'result'
  const [occasion, setOccasion] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [] = useState(null);
  const [weather, setWeather] = useState({ temp: 72, condition: "sunny" });

  useEffect(() => {
    // Simulate weather API call
    const conditions = ["sunny", "cloudy", "rainy"];
    const randomCondition =
      conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 40) + 50; // 50-90°F
    setWeather({ temp: randomTemp, condition: randomCondition });
  }, []);

  const handleGenerate = async () => {
    if (!occasion || !timeOfDay) {
      Alert.alert(
        "Missing Information",
        "Please select both occasion and time of day",
      );
      return;
    }

    setStep("generating");

    // TODO:  replace this with OutfitController.generateOutfit()
    // For now, just show the generating screen
    setTimeout(() => {
      Alert.alert(
        "Coming Soon!",
        "Outfit generation will be implemented by the controller team. They will:\n\n1. Fetch your uploaded clothes\n2. Use AI to match items\n3. Return a complete outfit",
        [
          {
            text: "OK",
            onPress: () => setStep("selection"),
          },
        ],
      );
    }, 2500);
  };

  const getWeatherIcon = () => {
    if (weather.condition === "sunny") return "☀️";
    if (weather.condition === "rainy") return "🌧️";
    return "☁️";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => Alert.alert("Back", "Navigate back to home")}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate Outfit</Text>
        </View>
        <View style={styles.weatherBadge}>
          <Text style={styles.weatherIcon}>{getWeatherIcon()}</Text>
          <Text style={styles.weatherText}>
            {weather.temp}°F - {weather.condition}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {/* Selection Step */}
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
                  {["Casual", "Business Casual", "Formal"].map((occ) => (
                    <TouchableOpacity
                      key={occ}
                      onPress={() =>
                        setOccasion(occ.toLowerCase().replace(" ", "-"))
                      }
                      style={[
                        styles.optionButton,
                        occasion === occ.toLowerCase().replace(" ", "-") &&
                          styles.optionButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          occasion === occ.toLowerCase().replace(" ", "-") &&
                            styles.optionButtonTextSelected,
                        ]}
                      >
                        {occ}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                  Time of Day
                </Text>
                <View style={styles.buttonGrid2}>
                  {["Morning", "Noon", "Afternoon", "Evening"].map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setTimeOfDay(time.toLowerCase())}
                      style={[
                        styles.optionButton,
                        timeOfDay === time.toLowerCase() &&
                          styles.optionButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          timeOfDay === time.toLowerCase() &&
                            styles.optionButtonTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
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

          {/* Generating Step */}
          {step === "generating" && (
            <View style={styles.generatingContainer}>
              <ActivityIndicator
                size="large"
                color="#42A5F5"
                style={{ marginBottom: 24 }}
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
                  ✓ Considering weather conditions
                </Text>
                <Text style={styles.statusItem}>
                  ✓ Matching colors and styles
                </Text>
              </View>
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
    gap: 16,
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
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  weatherIcon: {
    fontSize: 18,
  },
  weatherText: {
    fontSize: 12,
    color: "#666",
  },
  content: {
    flex: 1,
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
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#666",
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
    gap: 12,
  },
  buttonGrid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    minWidth: "45%",
  },
  optionButtonSelected: {
    borderColor: "#42A5F5",
    backgroundColor: "#E3F2FD",
  },
  optionButtonText: {
    fontSize: 14,
    color: "#333",
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
  generatingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  generatingSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    fontSize: 14,
    color: "#999",
  },
});

export default GenerateOutfitScreen;
