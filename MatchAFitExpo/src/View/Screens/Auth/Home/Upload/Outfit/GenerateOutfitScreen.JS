import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';


const GenerateOutfitScreen = ({ navigation = null }) => {
  const [step, setStep] = useState('selection'); // 'selection' | 'generating' | 'result'
  const [occasion, setOccasion] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [weather, setWeather] = useState({ temp: 72, condition: 'sunny' });

  useEffect(() => {
    // Simulate weather API call
    const conditions = ['sunny', 'cloudy', 'rainy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 40) + 50; // 50-90°F
    setWeather({ temp: randomTemp, condition: randomCondition });
  }, []);

  const generateRandomOutfit = () => {
    const tops = ['White T-Shirt', 'Blue Button-Down', 'Black Sweater', 'Gray Polo', 'Striped Shirt'];
    const bottoms = ['Black Jeans', 'Khaki Pants', 'Gray Slacks', 'Blue Jeans', 'Black Trousers'];
    const shoes = ['White Sneakers', 'Black Dress Shoes', 'Brown Loafers', 'Gray Running Shoes'];
    const accessories = ['Silver Watch', 'Leather Belt', 'Sunglasses', 'Backpack'];

    return {
      top: tops[Math.floor(Math.random() * tops.length)],
      bottom: bottoms[Math.floor(Math.random() * bottoms.length)],
      shoes: shoes[Math.floor(Math.random() * shoes.length)],
      accessory: accessories[Math.floor(Math.random() * accessories.length)],
    };
  };

  const handleGenerate = () => {
    if (!occasion || !timeOfDay) {
      Alert.alert('Missing Information', 'Please select both occasion and time of day');
      return;
    }

    setStep('generating');

    // Simulate AI generation
    setTimeout(() => {
      const outfit = {
        id: Date.now().toString(),
        occasion,
        timeOfDay,
        weather: weather.condition,
        temperature: weather.temp,
        items: generateRandomOutfit(),
        createdAt: new Date().toISOString(),
        worn: false,
      };

      setGeneratedOutfit(outfit);
      setStep('result');
    }, 2500);
  };

  const handleRegenerate = () => {
    setStep('generating');
    setTimeout(() => {
      const outfit = {
        ...generatedOutfit,
        id: Date.now().toString(),
        items: generateRandomOutfit(),
        createdAt: new Date().toISOString(),
      };
      setGeneratedOutfit(outfit);
      setStep('result');
    }, 2000);
  };

  const handleSave = () => {
    Alert.alert('Outfit Saved!', 'Your outfit has been saved to your library', [
      {
        text: 'OK',
        onPress: () => {
          // Reset to start over
          setStep('selection');
          setOccasion('');
          setTimeOfDay('');
          setGeneratedOutfit(null);
        },
      },
    ]);
  };

  const getWeatherIcon = () => {
    if (weather.condition === 'sunny') return '☀️';
    if (weather.condition === 'rainy') return '🌧️';
    return '☁️';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => Alert.alert('Back', 'Navigate back to home')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate Outfit</Text>
        </View>
        <View style={styles.weatherBadge}>
          <Text style={styles.weatherIcon}>{getWeatherIcon()}</Text>
          <Text style={styles.weatherText}>{weather.temp}°F - {weather.condition}</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {/* Selection Step */}
          {step === 'selection' && (
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>✨</Text>
                </View>
                <Text style={styles.cardTitle}>Create Your Perfect Outfit</Text>
                <Text style={styles.cardSubtitle}>Tell us about your event</Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Type of Occasion</Text>
                <View style={styles.buttonGrid3}>
                  {['Casual', 'Business Casual', 'Formal'].map((occ) => (
                    <TouchableOpacity
                      key={occ}
                      onPress={() => setOccasion(occ.toLowerCase().replace(' ', '-'))}
                      style={[
                        styles.optionButton,
                        occasion === occ.toLowerCase().replace(' ', '-') && styles.optionButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          occasion === occ.toLowerCase().replace(' ', '-') && styles.optionButtonTextSelected,
                        ]}
                      >
                        {occ}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Time of Day</Text>
                <View style={styles.buttonGrid2}>
                  {['Morning', 'Noon', 'Afternoon', 'Evening'].map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setTimeOfDay(time.toLowerCase())}
                      style={[
                        styles.optionButton,
                        timeOfDay === time.toLowerCase() && styles.optionButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          timeOfDay === time.toLowerCase() && styles.optionButtonTextSelected,
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
                  style={[styles.generateButton, (!occasion || !timeOfDay) && styles.generateButtonDisabled]}
                >
                  <Text style={styles.generateButtonText}>Generate Outfit ✨</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Generating Step */}
          {step === 'generating' && (
            <View style={styles.generatingContainer}>
              <ActivityIndicator size="large" color="#42A5F5" style={{ marginBottom: 24 }} />
              <Text style={styles.generatingTitle}>Generating Your Outfit...</Text>
              <Text style={styles.generatingSubtitle}>Our AI is selecting the perfect combination</Text>
              <View style={styles.statusList}>
                <Text style={styles.statusItem}>✓ Analyzing your closet</Text>
                <Text style={styles.statusItem}>✓ Considering weather conditions</Text>
                <Text style={styles.statusItem}>✓ Matching colors and styles</Text>
              </View>
            </View>
          )}

          {/* Result Step */}
          {step === 'result' && generatedOutfit && (
            <View>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Your Perfect Outfit!</Text>
                <Text style={styles.resultSubtitle}>
                  {occasion.replace('-', ' ')} • {timeOfDay}
                </Text>
              </View>

              <View style={styles.outfitContainer}>
                <View style={styles.outfitItem}>
                  <Text style={styles.outfitItemLabel}>Top</Text>
                  <Text style={styles.outfitItemValue}>{generatedOutfit.items.top}</Text>
                </View>
                <View style={styles.outfitItem}>
                  <Text style={styles.outfitItemLabel}>Bottom</Text>
                  <Text style={styles.outfitItemValue}>{generatedOutfit.items.bottom}</Text>
                </View>
                <View style={styles.outfitItem}>
                  <Text style={styles.outfitItemLabel}>Shoes</Text>
                  <Text style={styles.outfitItemValue}>{generatedOutfit.items.shoes}</Text>
                </View>
                <View style={styles.outfitItem}>
                  <Text style={styles.outfitItemLabel}>Accessory</Text>
                  <Text style={styles.outfitItemValue}>{generatedOutfit.items.accessory}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={handleRegenerate} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>🔄 Try Another</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>💾 Save Outfit</Text>
                </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
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
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#42A5F5',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  formSection: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonGrid3: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    minWidth: '45%',
  },
  optionButtonSelected: {
    borderColor: '#42A5F5',
    backgroundColor: '#E3F2FD',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  optionButtonTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#42A5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#42A5F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  generatingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  generatingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  generatingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    fontSize: 14,
    color: '#999',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  outfitContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  outfitItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outfitItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  outfitItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#42A5F5',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#42A5F5',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GenerateOutfitScreen;