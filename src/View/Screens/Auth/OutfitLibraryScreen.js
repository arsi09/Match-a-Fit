/**
 * Created by Brianna 4/6/26
 * OutfitLibraryScreen.JS
 * Purpose:
 * - Handles UI for Outfit Library Screen
 * - Displays saved outfits by occasion 
 * - Delegates all backend logic to OutfitLibraryController
 */

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OutfitLibraryController from '../../../Controllers/OutfitLibraryController';

//occasions for filtering outfits
const OCCASIONS = ['All', 'Casual', 'Formal Casual', 'Business Casual'];

//Filter chip component for occasion filtering 
const FilterChip = ({ label, active, onPress }) => (
    <TouchableOpacity
        style={[styles.chip, active && styles.chipActive]}
        onPress={onPress}
    >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>
            {label === 'all' ? 'All' : label}
        </Text>
    </TouchableOpacity>
);

//Displays outfit details, includes edit and delete buttons
const OutfitCard = ({ outfit, onEdit, onDelete, isDeleting }) => (
    <View style={[styles.card, isDeleting && styles.cardFading]}>
        {/* Header with occasion and time of day */}
        <View style={styles.cardHeader}>
            <View>
                <Text style={styles.occasionText}>{outfit.occasion}</Text>
                <Text style={styles.timeText}>{outfit.timeOfDay}</Text>
            </View>
        </View>

        {/* List of outfit items */}
        <View style={styles.itemsContainer}>
            {['Shirt', 'Pants', 'Dress', 'Shorts/Skirt','Jacket/Hoodie'].map((slot) => (
                outfit.items[slot] ? (
                  <View key={slot} style={styles.itemRow}>
                      <Text style={styles.itemLabel}>{slot}:</Text>
                      <View style = {styles.itemPhotoRow}>
                          <Image 
                              source={{ uri: OutfitLibraryController.getPhotoUri(outfit.items[slot]) }}
                              style={styles.itemPhoto}
                              resizeMode="cover"
                          />
                          <Text style={styles.itemValue}>{outfit.items[slot]}</Text>
                      </View>
                  </View>
                ) : null
            ))}
        </View>
    
        {/* Footer with creation date and action buttons */}
        <View style={styles.cardFooter}>
            <Text style = {styles.dateText}>
                {new Date(outfit.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.actionRow}>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnEdit]}
                    onPress= {onEdit}
                    disabled={isDeleting}
                >
                    <Text style={styles.actionBtnText}>Edit ✎</Text>
                </TouchableOpacity>

                {/* Show loading spinner on delete button while delete request is in-flight */}
                <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDelete]}
                    onPress= {onDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? <ActivityIndicator color="#fff" size = 'small'/> :
                        <Text style={styles.actionBtnText}>Delete 🗑 </Text>}

                </TouchableOpacity>
            </View>
        </View>
    </View>
);

//Main Screen Component
const OutfitLibraryScreen = ({ navigation }) => {
    const [outfits, setOutfits] = useState([]); //full list of outfits from backend
    const [filtered, setFiltered] = useState([]); //filtered list shown in scrollview
    const [activeOccasion, setActiveOccasion] = useState('All'); //occasion filter state, all shows everything
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null); //track which outfit is being deleted for UI feedback

    //Load outfits from backend(controller) on screen load
    useEffect(() => {
        const fetchOutfits = async () => {
            try {
                const data = await OutfitLibraryController.loadOutfits();
                setOutfits(data);
            } catch (err) {
                Alert.alert('Error', err.message || 'Failed to load outfits');
            } finally {
                setLoading(false);
            }
        };
        fetchOutfits();
    }, []);
    
    //Apply occasion filter whenever outfits or activeOccasion state changes
    useEffect(() => {
        setFiltered(OutfitLibraryController.filterByOccasion(outfits, activeOccasion));
    }, [outfits, activeOccasion]);

    //Handles delete action with confirmation alert, calls controller to delete and updates state on success
    const handleDelete = (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this outfit?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                        setDeletingId(id);
                        try {
                            const updated = await OutfitLibraryController.deleteOutfit(id, outfits);
                            setOutfits(updated);
                        } catch (err) {
                            Alert.alert('Error', err.message || 'Failed to delete outfit');
                        } finally {
                        setDeletingId(null);
                        }
                    }
                },           
            ]
        );
    };

    return (
        <View style={styles.container}>

            {/* Back button to return to home screen */}
            <TouchableOpacity style = {styles.backButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Outfit Library</Text>

            {/* Occasion filter chips */}
            <View style={styles.filterCard}>
                <Text style={styles.filterLabel}>Filter by Occasion:</Text>
                <View style = {styles.chipsRow}>
                    {OCCASIONS.map((occ) => (
                        <FilterChip
                            key={occ}
                            label={occ}
                            active = {activeOccasion === occ}
                            onPress={() => setActiveOccasion(occ)}
                        />
                    ))}
                </View>
            </View>

            {/* Show loading spinner while outfits are being fetched from backend */}
            {loading ? (
                <ActivityIndicator style = {styles.loader}
                    size="large"
                    color="#4db8d4"
                />
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                >
                    {/* Show empty state if no outfits match the filter, otherwise show list of outfits */}
                    {filtered.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style= {styles.emptyIcon}>👗</Text>
                            <Text style={styles.emptyTitle}>No outfits saved yet!</Text>
                            <Text style={styles.emptySubtitle}>   
                                {activeOccasion === 'All'
                                ? 'Start generating outfits to build your collection!'
                                : `No outfits saved for ${activeOccasion} occasions yet!`}
                            </Text>
                        </View>
                    ) : (
                        // Render outfit card per filtered outfit 
                        filtered.map((outfit) => (
                            <OutfitCard
                                key={outfit.id}
                                outfit={outfit}
                                onEdit={() => navigation.navigate('EditOutfit', { outfitId: outfit.id })}
                                onDelete={() => handleDelete(outfit.id)}
                                isDeleting={deletingId === outfit.id}
                            />  
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}; 

//UI styles for Outfit Library Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#daf0f7',
    paddingTop: 48,
    paddingHorizontal: 16,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
  },

  // ── Filter bar
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e8f7fb',
    borderWidth: 1,
    borderColor: '#000000',
  },

  // Applied on top of chip when this occasion is the active filter
  chipActive: {
    backgroundColor: '#4db8d4',
    borderColor: '#4db8d4',
  },

  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },

  // Applied on top of chipText when this chip is active
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  loader: {
    marginTop: 60,
  },

  listContent: {
    paddingBottom: 40,
    gap: 14,
  },

  // ── Empty state

  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },

  // ── Outfit card

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  // Fades the card while a delete request is in-flight
  cardFading: {
    opacity: 0.4,
  },

  cardHeader: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },

  occasionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    textTransform: 'capitalize',
  },

  timeText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textTransform: 'capitalize',
  },

  itemsContainer: {
    padding: 14,
    gap: 8,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  itemLabel: {
    width: 100,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
    flexShrink: 0,
  },

  itemPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  itemPhoto: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },

  itemValue: {
    flex: 1,
    fontSize: 13,
    color: '#1f2937',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },

  dateText: {
    fontSize: 11,
    color: '#9ca3af',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },

  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionBtnEdit: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#000000',
  },

  actionBtnDelete: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#000000',
  },

  actionBtnText: {
    fontSize: 14,
    color: '#000000',
  },
});

export default OutfitLibraryScreen;