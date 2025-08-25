import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useAuthStore } from "../../../store/authStore";

import { Image } from "expo-image";
import { useEffect, useState } from "react";

import styles from "../../../assets/styles/home.styles";
import { API_URL } from "../../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../../../lib/utils";
import COLORS from "../../../constants/colors";
import LoaderSpinner from "../../../components/LoaderSpinner";
import { sleep } from "../../../lib/utils";
import { Link } from "expo-router";

export default function Home() {
  const { token, user } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // call to api (integrate with infinite scrolling technique below)
  const fetchBooks = async (pageNum = 1, refresh = false) => {
    try {
      if(refresh) {
        setRefreshing(true);
      } 
      else if(pageNum === 1) {
        setLoading(true);
      } 

      const response = await fetch(`${API_URL}/books?page=${pageNum}&limit=2`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      const data = await response.json();

      if(!response.ok) { 
        throw new Error(data.message || "Failed to fetch books!");
      }

      // issue: show duplicated and be error when reloading page 
      // setBooks((prevBooks) => [...prevBooks, ...data.books]);

      // solution:
      const nonDuplicatedBooks =
        refresh || pageNum === 1
          ? data.books
          : Array
              .from(
                new Set([...books, ...data.books].map((book) => book._id))
              )
              .map(
                (id) => [...books, ...data.books].find((book) => book._id === id)
              );
      setBooks(nonDuplicatedBooks);

      if(pageNum < data.totalPages) {
        setHasMore(true);
      }
      else {
        setHasMore(false);
      }

      setPage(pageNum);
    } 
    catch (error) {
      console.log("Error fetching books", error);
    } 
    finally { // always
      if(refresh) {
        await sleep(800); // add delay when reload page by pulling the page down
        setRefreshing(false);
      } 
      else {
        setLoading(false);
      } 
    }
  };

  useEffect(() => {
    if(token) {
      fetchBooks();
    }
  }, [token]);

  // --- fetchMoreBook with infinite scrolling technique
  const handleLoadMore = async () => {
    if(hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1); // call to the api again
    }
  };
  // --- End fetchMoreBook with infinite scrolling technique

  const renderRatingStars = (rating) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = Math.min(Math.max(rating - i, 0), 1); // between 0–1

          return (
            <View key={i} style={{ position: "relative", marginRight: 2 }}>
              {/* outline star */}
              <Ionicons name="star-outline" size={22} color="#f4b400" />
              {/* filled star clipped */}
              <View
                style={{
                  position: "absolute",
                  overflow: "hidden",
                  width: 22 * filled,
                  height: 22,
                }}
              >
                <Ionicons name="star" size={22} color="#f4b400" />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // destructure syntax { item }
  const renderItem = ({ item }) => {
    const isCreator = item.user._id === user.id;

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: item.user.profileImage }} 
              style={styles.avatar} 
            />
            <Text style={styles.username}>
              {item.user.username}
            </Text>
          </View>
        </View>

        <View style={styles.bookImageContainer}>
          <Image 
            source={item.image}
            style={styles.bookImage} 
            contentFit="cover" 
          />
        </View>

        <View style={styles.bookDetails}>
          <View style={styles.titleRow}>
            <Text style={styles.bookTitle}>{item.title}</Text>
            {isCreator && (
              <Link href={`/admin/book-edit/${item._id}`} asChild>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={20} color={COLORS.white} />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
          <View style={styles.ratingContainer}>
            {renderRatingStars(item.avgRating)}
          </View>
          <Text style={styles.caption}>{item.caption}</Text>
          <Text style={styles.date}>
            Published on {formatPublishDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if(loading) return <LoaderSpinner size="large" color="#ff0000" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false} // not show scrollbar
        //-- reload page by pulling the list down
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBooks(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        //-- End reload page by pulling the list down

        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1} // how far from the end to trigger (here is to call the api) 
                                    // used to enhance UX
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookStore</Text>
            <Text style={styles.headerSubtitle}>Find your suitable books</Text>
          </View>
        }
        //-- draw spinner at the end
        ListFooterComponent={
          hasMore && books.length > 0 
            ? (
              <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
            ) 
            : null
        }
        //-- End draw spinner at the end
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
          </View>
        }
      />
    </View>
  );
}