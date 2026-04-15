/**
 * ViewClosetScreen.js
 * Purpose:
 * - Displays all clothing items in the user's closet
 * - Uses photoUri built by the Python model
 */

import { useEffect, useState } from 'react';
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
import ViewClosetController from '../../../Controllers/ViewClosetController';

const CATEGORIES = [
  'Shirt',
  'Pants',
  'Dress',
  'Shorts/Skirt',
  'Jacket/Hoodie',
  'Shoes',
];

const CategoryBadge = ({ category, count }) => (
  <View style={styles.categoryBadge}>
    <Text style={styles.categoryCount}>{count}</Text>
    <Text style={styles.categoryLabel}>{category}</Text>
  </View>
);

const ClothingCard = ({ item, onDelete, isDeleting }) => {
  return (
    <View style={[styles.card, isDeleting && styles.cardFading]}>
      {item.photoUri ? (
        <Image
          source={{ uri: item.photoUri }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{item.category}</Text>
          </View>
        </View>

        <Text style={styles.occasionText}>Occasion: {item.occasion}</Text>
        <Text style={styles.dateText}>
          Added {new Date(item.uploadedAt).toLocaleDateString()}
        </Text>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <Text style={styles.deleteBtnText}>Delete 🗑</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ViewClosetScreen = () => {
  const [user, setUser] = useState(null);
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await ViewClosetController.getCurrentUser();

        if (!userData) {
          ViewClosetController.redirectToLogin();
          return;
        }

        setUser(userData);

        const resolvedUserId =
          userData.id || userData.user_id || userData.userId || null;

        await ViewClosetController.clearClosetCache();

        const items = await ViewClosetController.loadClothingItems(
          resolvedUserId
        );

        console.log('Loaded closet items:', JSON.stringify(items, null, 2));

        setClothingItems(items);
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to load closet');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

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
              const updated = await ViewClosetController.deleteClothingItem(
                itemId,
                clothingItems
              );
              setClothingItems(updated);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete item');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={ViewClosetController.goBack}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Closet</Text>

        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>
            {clothingItems.length} {clothingItems.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {clothingItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👚</Text>
            <Text style={styles.emptyTitle}>Your closet is empty!</Text>
            <Text style={styles.emptySubtitle}>
              Start uploading your clothes to create outfits.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.categoryCard}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => (
                  <CategoryBadge
                    key={category}
                    category={category}
                    count={ViewClosetController.countByCategory(
                      clothingItems,
                      category
                    )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#daf0f7',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#daf0f7',
  },

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
    backgroundColor: '#daf0f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  itemCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

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

  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '47.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cardFading: {
    opacity: 0.4,
  },

  cardImage: {
    height: 110,
    width: '100%',
    backgroundColor: '#e5e7eb',
  },

  imagePlaceholder: {
    height: 110,
    width: '100%',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imagePlaceholderText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
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

  occasionText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
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