import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../../constants/colors";
import { API_URL } from "../../../constants/api";
import { formatPublishDate } from "../../../lib/utils";
import WebView from "react-native-webview";

export default function BookDetailPage() {
  const { id } = useLocalSearchParams(); // catch [id]
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBook = async () => {
    try {
      const res = await fetch(`${API_URL}/client/books/detail/${id}`);
      const data = await res.json();

      if(!res.ok) {
        throw new Error(data.message || "Failed to fetch detailed book!");
      } 

      setBook(data.bookDetail);
    } 
    catch (err) {
      console.error("Error fetching book:", err);
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  if(loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if(!book) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Book not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={book.image} style={styles.image} />

      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.date}>
        Published {formatPublishDate(book.updatedAt)}
      </Text>
      <Text style={styles.caption}>{book.caption}</Text>

      <View style={styles.rating}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < book.rating ? "star" : "star-outline"}
            size={20}
            color={i < book.rating ? "#f4b400" : COLORS.textSecondary}
          />
        ))}
      </View>

      {book.fileBook && (
        <View style={styles.pdfContainer}>
          <Text style={styles.pdfTitle}>Read the Book</Text>
          <WebView
            source={{ uri: `https://docs.google.com/viewer?url=${encodeURIComponent(book.fileBook)}` }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error:", nativeEvent);
            }}
          />
        </View>
      )}
    </ScrollView> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  date: {
    fontSize: 14,
    color: "gray",
    marginTop: 4,
  },
  caption: {
    fontSize: 16,
    marginTop: 16,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  pdfContainer: {
    marginTop: 20,
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  webview: {
    width: "100%",
    height: 400,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});