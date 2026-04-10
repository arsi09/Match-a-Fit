/**
 * Created by Brianna 4/7/26
 * ViewClosetScreen.JS
 * Purpose:
 * - Handles UI for View Closet Screen
 * - Displays all clothing items in the user's closet 
 * - Delegates all backend logic to ViewClosetController
 */

import React, { useEffect, useState } from "react";
import {
  View, 
  Text, 
  StyleSheet,
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import ViewClosetController from '../../../Controllers/ViewClosetController';

//clothing categories
const CATEGORIES = ['Shirt', 'Pants', 'Dress', 'Shorts/Skirt','Jacket/Hoodie'];

// Badge component for showing category breakdown at top of screen
const CategoryBadge = ({ category, count}) => (
    <View style={styles.categoryBadge}>
        <Text style={styles.categoryCount}>{count}</Text>
        <Text style={styles.categoryLabel}>{category}</Text>
    </View>
);

//Display clothing item card with information about the item and delete button
const ClothingCard = ({ item, onDelete, isDeleting }) => (
    <View style={[styles.card, isDeleting && styles.cardFading]}>

        {/* Colored swatch at top of card based on item's color */}
        <View style = {[styles.cardSwatch, {backgroundColor: item.color}]} />

        <View style = {styles.cardBody}>
            <View style = {styles.cardTopRow}>
                <View style = {styles.categoryPill}>
                    <Text style = {styles.categoryPillText}>{item.category}</Text>
                </View>
                <View style = {styles.colorRow}>
                    <View style = {[styles.colorDot, {backgroundColor: item.color}]} />
                    <Text style = {styles.colorText}>{item.color}</Text>
                </View>
            </View>

            {/* Show date item was added at bottom of card */}
            <Text style = {styles.dateText}>
                Added {new Date(item.uploadedAt).toLocaleDateString()}
            </Text>

            {/*Delete button that shows loading spinner*/}
            <TouchableOpacity
                style = {styles.deleteBtn}
                onPress={onDelete}
                disabled={isDeleting}
            >
                {isDeleting 
                    ? <ActivityIndicator color="#dc2626" size = "small" />
                    : <Text style = {styles.deleteBtnText}>Delete 🗑</Text>
                }
            </TouchableOpacity>
        </View>
    </View>
);

// Main screen component for viewing closet
const ViewClosetScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    //Fetches data from backend for current user and their clothing items on component mount, redirects to login if no user found
    useEffect(() => {
        const initialize = async () => {
            try {
                const userData = await ViewClosetController.getCurrentUser();
                
                if (!userData) {
                    navigation.replace('Login');
                    return;
                }

                setUser(userData);
                const items = await ViewClosetController.loadClothingItems(userData.id);
                setClothingItems(items);
            } catch (err) {
                Alert.alert('Error', err.message || 'Failed to load closet');
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);


    //Handles deleting clothing item when delete button is pressed, shows confirmation alert before deleting
    const handleDelete = (itemId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingId(itemId);
                        try {
                            const updated = await ViewClosetController.deleteClothingItem(itemId, clothingItems, user);
                            setClothingItems(updated);
                        } catch (err) {
                          Alert.alert('Error', err.message || 'Failed to delete item');
                        } finally {
                            setDeletingId(null);
                        }
                    }
                }
            ]
        );
    }   
    
    //shows loading spinner while getting data from the backend
    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#60a5fa" />
            </View>
        );
    }

// Main UI for View Closet Screen
    return (
        <View style={styles.container}>

            {/* Header with back button, title, and item count badge */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>My Closet</Text>

                <View style = {styles.itemCountBadge}>
                    <Text style = {styles.itemCountText}>
                        {clothingItems.length} {clothingItems.length === 1 ? ' item' : ' items'}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/*Shows when user has no clothing items in their closet*/}
                {clothingItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>👚</Text>
                        <Text style={styles.emptyTitle}>Your closet is empty!</Text>
                        <Text style={styles.emptySubtitle}>Start uploading your clothes to create outfits.</Text>
                    </View>
                ) : (
                    <>

                        {/* Category breakdown at top of screen showing how many items user has in each category */}
                        <View style={styles.categoryCard}>
                            <Text style={styles.sectionTitle}>Categories</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat) => (
                                    <CategoryBadge 
                                        key={cat} 
                                        category={cat}
                                        count = {ViewClosetController.countByCategory(clothingItems, cat)}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.itemsGrid}>
                            {clothingItems.map((item) => (
                                <ClothingCard
                                    key={item.id}
                                    item={item}
                                    onDelete={() => handleDelete(item.id)}
                                    isDeleting={deletingId === item.id}
                                />
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};


// UI styles for View Closet Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeafe', // light blue background
  },
 
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
  },
 
  // ── Header ────────────────────────────────────────────────────────────────────
 
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
 
  backButton: {
    alignSelf: 'flex-start',
    marginRight: 4,
  },
 
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
 
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1,
  },
 
  itemCountBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
 
  itemCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
  },
 
  // ── Scroll content ────────────────────────────────────────────────────────────
 
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
 
  // ── Empty state ───────────────────────────────────────────────────────────────
 
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
 
  // ── Category breakdown ────────────────────────────────────────────────────────
 
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
 
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
 
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
 
  categoryBadge: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
  },
 
  categoryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
 
  categoryLabel: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
 
  // ── Clothing items grid ───────────────────────────────────────────────────────
 
  // Two-column grid using flexWrap
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
 
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '47.5%', // two columns with gap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
 
  // Fades the card while a delete request is in-flight
  cardFading: {
    opacity: 0.4,
  },
 
  // Colored swatch at the top of the card based on item color
  cardSwatch: {
    height: 80,
    width: '100%',
  },
 
  cardBody: {
    padding: 10,
  },
 
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 4,
  },
 
  categoryPill: {
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
 
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d4ed8',
    textTransform: 'capitalize',
  },
 
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
 
  // Small circle showing the item's actual color
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
 
  colorText: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
 
  dateText: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 8,
  },
 
  deleteBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
 
  deleteBtnText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
});
 
export default ViewClosetScreen;