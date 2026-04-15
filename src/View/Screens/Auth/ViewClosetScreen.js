/**
 * ViewClosetScreen.js
 * Purpose:
 * - Displays all saved clothing items for the current user
 * - Filters by category/type
 * - Allows deleting items
 * - Uses ViewClosetController for backend logic
 */

import { useRouter } from "expo-router";
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
} from "react-native";
import ViewClosetController from "../../../Controllers/ViewClosetController";

// Put all category values in one place so they are easy to update
const CATEGORIES = [
  "All",
  "Shirt",
  "Pants",
  "Dress",
  "Shorts/Skirt",
  "Jacket/Hoodie",
  "Shoes",
];

const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ClosetCard = ({ item, onDelete, isDeleting }) => (
  <View style={[styles.card, isDeleting && styles.cardFading]}>
    <View style={styles.cardContent}>
      {ViewClosetController.getPhotoUri(item) ? (
        <Image
          source={{ uri: ViewClosetController.getPhotoUri(item) }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.itemType}>{item.type || "Unknown Type"}</Text>
        <Text style={styles.itemOccasion}>
          Occasion: {item.occasion || "Casual"}
        </Text>
        <Text style={styles.itemDate}>
          {item.uploaded_at
            ? new Date(item.uploaded_at).toLocaleDateString()
            : "No date"}
        </Text>
      </View>
    </View>

    <View style={styles.cardFooter}>
      <TouchableOpacity
        style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
        onPress={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.deleteBtnText}>Delete 🗑</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const ViewClosetScreen = () => {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await ViewClosetController.loadItems();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        Alert.alert("Error", err.message || "Failed to load closet items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    setFilteredItems(
      ViewClosetController.filterByType(items, activeCategory)
    );
  }, [items, activeCategory]);

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this clothing item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(id);
              await ViewClosetController.deleteItem(id);

              const updatedItems = items.filter((item) => item.id !== id);
              setItems(updatedItems);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete item");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>My Closet</Text>

      <View style={styles.filterCard}>
        <Text style={styles.filterLabel}>Filter by Category:</Text>

        <View style={styles.chipsRow}>
          {CATEGORIES.map((category) => (
            <FilterChip
              key={category}
              label={category}
              active={activeCategory === category}
              onPress={() => setActiveCategory(category)}
            />
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4db8d4" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👕</Text>
              <Text style={styles.emptyTitle}>No clothing items yet!</Text>
              <Text style={styles.emptySubtitle}>
                {activeCategory === "All"
                  ? "Upload clothing items to build your closet!"
                  : `No items saved in ${activeCategory} yet!`}
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <ClosetCard
                key={item.id}
                item={item}
                onDelete={() => handleDelete(item.id)}
                isDeleting={deletingId === item.id}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#daf0f7",
    paddingTop: 48,
    paddingHorizontal: 16,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },

  backButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 16,
  },

  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e8f7fb",
    borderWidth: 1,
    borderColor: "#000000",
  },

  chipActive: {
    backgroundColor: "#4db8d4",
    borderColor: "#4db8d4",
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },

  chipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  loader: {
    marginTop: 60,
  },

  listContent: {
    paddingBottom: 40,
    gap: 14,
  },

  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 48,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 240,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  cardFading: {
    opacity: 0.4,
  },

  cardContent: {
    flexDirection: "row",
    padding: 14,
    gap: 12,
    alignItems: "center",
  },

  photo: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },

  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },

  photoPlaceholderText: {
    fontSize: 12,
    color: "#6b7280",
  },

  infoSection: {
    flex: 1,
    gap: 6,
  },

  itemType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },

  itemOccasion: {
    fontSize: 14,
    color: "#4b5563",
  },

  itemDate: {
    fontSize: 12,
    color: "#9ca3af",
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "flex-end",
  },

  deleteBtn: {
    minWidth: 90,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#000000",
  },

  deleteBtnDisabled: {
    opacity: 0.7,
  },

  deleteBtnText: {
    fontSize: 14,
    color: "#000000",
  },
});

export default ViewClosetScreen;