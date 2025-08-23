import { useEffect, useState } from "react";
import {
  View,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Link, useRouter, useSegments } from "expo-router";
import { API_URL } from "../../../../constants/api";
import { useAuthStore } from "../../../../store/authStore";
import styles from "../../../../assets/styles/profile.styles";
import ProfileHeader from "../../../../components/ProfileHeader";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../../../constants/colors";
import { Image } from "expo-image";
import { sleep } from "../../../../lib/utils";
import LoaderSpinner from "../../../../components/LoaderSpinner";

export default function ProfilePage() {
  const segments = useSegments();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);

  const { token, checkAuth } = useAuthStore();

  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/books/user`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      const data = await response.json();
      
      if(!response.ok) { 
        throw new Error(data.message || "Failed to fetch user books");
      }

      setBooks(data.books);
    } 
    catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load profile data. Pull down to refresh.");
    } 
    finally { // always
      setIsLoading(false); // use for spinner while deleting action
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteBook = async (bookId) => {
    try {
      setDeleteBookId(bookId);

      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      const data = await response.json();

      if(!response.ok) { 
        throw new Error(data.message || "Failed to delete book");
      }

      setBooks(books.filter((book) => book._id !== bookId));

      Alert.alert("Success", "Delete record successfully!");
    } 
    catch (error) {
      Alert.alert("Error", error.message || "Failed to delete recommendation");
    } 
    finally {
      setDeleteBookId(null);
    }
  };

  const confirmDelete = (bookId) => {
    Alert.alert(
      "Delete Book", 
      "Are you sure you want to delete this record? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDeleteBook(bookId) },
      ]
    );
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={item.image} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.bookDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.groupButtonsEditDelete}>
        <Link href={`/admin/book-edit/${item._id}`} asChild>
          <TouchableOpacity 
            style={styles.editBookButton} 
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </Link>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => confirmDelete(item._id)}
        >
          {deleteBookId === item._id ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={"#e80000ff"} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    for(let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(500); // delay first then fetchData
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    checkAuth();
  }, [segments]); // used for simulating in remove token

  if(isLoading && !refreshing) return <LoaderSpinner size="large" color="#ff0000" />;
  
  return (
    <View style={styles.container}>
      <ProfileHeader />

      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Published Books</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false} // not show scrollbar
        contentContainerStyle={styles.booksList}
        //-- reload page by pulling the list down
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        //-- End reload page by pulling the list down
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={50} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No documents yet</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => router.push("/admin/(tabs)/book-create/")} // index => '/'
                                                                        // router(book-create/)
                                                                        // router(book-create) also correct
            >
              <Text style={styles.addButtonText}>Publish Your First Book!</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}