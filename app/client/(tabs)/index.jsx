import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { Image } from "expo-image";
import { useEffect, useState } from "react";

import styles from "../../../assets/styles/home.styles";
import searchStyles from "../../../assets/styles/search.styles"
import { API_URL } from "../../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../../../lib/utils";
import COLORS from "../../../constants/colors";
import LoaderSpinner from "../../../components/LoaderSpinner";
import { sleep } from "../../../lib/utils";
import { Link } from "expo-router";
import { useDebounce } from "../../../hooks/useDebounce";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // call to api (integrate with infinite scrolling technique below)
  const fetchBooks = async (pageNum = 1, refresh = false, query = "") => {
    try {
      if(refresh) {
        setRefreshing(true);
      } 
      else if (pageNum === 1 && !query && books.length === 0) {
        setLoading(true); // only show big loader on very first load
      } 
      else if (pageNum === 1) {
        setSearchLoading(true); // small loader when searching
      }

      const url = query
        ? `${API_URL}/client/search?inputKeyword=${encodeURIComponent(query)}&page=${pageNum}&limit=2`
        : `${API_URL}/client/books?page=${pageNum}&limit=2`;

      const response = await fetch(url);
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
      setBooks([]);
    } 
    finally { // always
      if(refresh) {
        await sleep(800); // add delay when reload page by pulling the page down
        setRefreshing(false);
      } 
      else {
        setLoading(false);
        setSearchLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // --- fetchMoreBook with infinite scrolling technique
  const handleLoadMore = async () => {
    if(hasMore && !loading && !refreshing && !searchLoading) {
      await fetchBooks(page + 1, false, searchQuery); // call to the api again
    }
  };
  // --- End fetchMoreBook with infinite scrolling technique

  const handleSearch = async (query) => {
    setPage(1);
    await fetchBooks(1, false, query);
  }

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);
  // useEffect(() => {
  //   handleSearch(debouncedSearchQuery);
  // }, [debouncedSearchQuery]);

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
  const renderItem = ({ item }) => (
    <Link href={`/client/book-detail/${item._id}`} asChild>
      <TouchableOpacity>
        <View style={styles.bookCard}>
          <View style={styles.bookImageContainer}>
            <Image 
              source={item.image}
              style={styles.bookImage} 
              contentFit="cover" 
            />
          </View>

          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{item.title}</Text>
            <View style={styles.ratingContainer}>
              {renderRatingStars(item.avgRating)}
            </View>
            <Text style={styles.caption} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.date}>
              Published on {formatPublishDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  if(loading && searchQuery != "") {
    return <LoaderSpinner size="large" color="#ff0000" />;
  }

  return (
    <View style={styles.container}>
      <View style={searchStyles.searchSection}>
        <View style={searchStyles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textLight}
            style={searchStyles.searchIcon}
          />
          <TextInput
            style={searchStyles.searchInput}
            placeholder="Search books..."
            placeholderTextColor={COLORS.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery !== "" && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery("");
                // setPage(1);
              }}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={searchStyles.loadingContainer}>
          <LoaderSpinner size="small" color={COLORS.primary} />
        </View>
      ) : (
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
              onRefresh={() => fetchBooks(1, true, searchQuery)}
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
            (hasMore || searchLoading) && books.length > 0 
              ? (
                <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
              ) 
              : null
          }
          //-- End draw spinner at the end
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No books found</Text>
              <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}