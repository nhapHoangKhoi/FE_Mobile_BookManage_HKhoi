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
import LogoutClientButton from "../../../../components/LogoutClientButton";

export default function ProfilePage() {
  const segments = useSegments();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { tokenClient, userClient, checkAuthClient } = useAuthStore();

  const router = useRouter();

  const fetchData = async () => {
    if(!userClient || !tokenClient) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/client/favorites/${userClient.id}`, {
        headers: { 
          Authorization: `Bearer ${tokenClient}` 
        },
      });
      const data = await response.json();
      
      if(!response.ok) { 
        throw new Error(data.message || "Failed to fetch favorite books");
      }

      setBooks(data.favoriteBooks);
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
  }, [userClient, tokenClient]);

  useEffect(() => {
    checkAuthClient();
  }, [segments]);

  const renderBookItem = ({ item }) => {
    return(
      <View style={styles.bookItemClient}>
        <Image source={item.bookId.image} style={styles.bookImage} />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.bookId.title}</Text>
          <View style={styles.ratingContainer}>
            {renderRatingStars(item.bookId.rating)}
          </View>
          <Text style={styles.bookCaption} numberOfLines={2}>
            {item.bookId.caption}
          </Text>
          <Text style={styles.bookDate}>
            {new Date(item.bookId.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Link href={`/client/book-detail/${item.bookId._id}`} asChild>
          <TouchableOpacity 
            style={styles.viewMoreDetailButton} 
          >
            <Ionicons name="book-outline" size={18} color={COLORS.white} />
            <Text style={styles.logoutText}>More detail</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

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

  // if(isLoading && !refreshing) return <LoaderSpinner size="large" color="#ff0000" />;

  return (
    <View style={styles.container}>
      {tokenClient ? (
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: userClient.profileImage }} 
            style={styles.profileImage} 
          />

          <View style={styles.profileInfo}>
            <Text style={styles.username}>{userClient.username}</Text>
            <Text style={styles.email}>{userClient.email}</Text>
          </View>

          <View style={styles.groupButtonsProfile}>
            <TouchableOpacity 
              style={styles.editProfileButton} 
            >
              <Ionicons name="create-outline" size={18} color={COLORS.white} />
              <Text style={styles.logoutText}>Edit</Text>
            </TouchableOpacity>

            <LogoutClientButton />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.profileHeader}>
            <Ionicons 
              name="person-circle-outline" 
              size={80} color={"grey"} 
              style={styles.profileImage} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>Username</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Farvorite Books</Text>
        {tokenClient ? (
          <Text style={styles.booksCount}>{books.length} books</Text>
        ) : (
          <Text style={styles.booksCount}>0 books</Text>
        )}
      </View>

      {tokenClient ? (
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
            </View>
          }
        />
      ) : (
        <TouchableOpacity 
          style={styles.loginClientButton} 
          onPress={() => router.push("../../../(auth)/login-client")}
        >
          <Text style={styles.loginClientText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}