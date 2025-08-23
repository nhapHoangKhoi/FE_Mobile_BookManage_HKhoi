import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import WebView from "react-native-webview";
import COLORS from "../../../constants/colors";
import { API_URL } from "../../../constants/api";
import { formatPublishDate } from "../../../lib/utils";

export default function BookDetailPage() {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);
  const [showFullScreenPdf, setShowFullScreenPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const router = useRouter();

  const fetchBook = async () => {
    try {
      const res = await fetch(`${API_URL}/client/books/detail/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch detailed book!");
      }

      setBook(data.bookDetail);
    } catch (err) {
      console.error("Error fetching book:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Image source={book.image} style={styles.image} contentFit="cover" />
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
              size={22}
              color={i < book.rating ? "#f4b400" : COLORS.textSecondary}
            />
          ))}
        </View>
      </View>

      {book.fileBook && (
        <View style={styles.pdfContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.readButton}
              onPress={() => setShowPdf(!showPdf)}
            >
              <Text style={styles.readButtonText}>
                {showPdf ? "Hide Book" : "View Book"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.readButton, styles.fullScreenButton]}
              onPress={() => setShowFullScreenPdf(true)}
            >
              <Ionicons name="expand" size={20} color="#fff" />
              <Text style={styles.readButtonText}>Full Screen</Text>
            </TouchableOpacity>
          </View>

          {showPdf && (
            <View style={styles.webviewContainer}>
              {pdfError ? (
                <Text style={styles.errorText}>
                  Failed to load PDF. Please try again.
                </Text>
              ) : (
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
                    setPdfError(true);
                  }}
                />
              )}
            </View>
          )}
        </View>
      )}

      {/* Full-Screen PDF Modal */}
      <Modal
        visible={showFullScreenPdf}
        animationType="slide"
        onRequestClose={() => setShowFullScreenPdf(false)}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{book.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFullScreenPdf(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          {pdfError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>
                Failed to load PDF. Please try again.
              </Text>
            </View>
          ) : (
            <WebView
              source={{ uri: `https://docs.google.com/viewer?url=${encodeURIComponent(book.fileBook)}` }}
              style={styles.fullScreenWebview}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView error:", nativeEvent);
                setPdfError(true);
              }}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  caption: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: 12,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  pdfContainer: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  readButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  fullScreenButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  readButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  webviewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  webview: {
    width: Dimensions.get("window").width - 32,
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    padding: 16,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  fullScreenWebview: {
    flex: 1,
  },
});