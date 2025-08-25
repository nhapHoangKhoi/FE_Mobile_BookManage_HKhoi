import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Modal, Alert } from "react-native";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import WebView from "react-native-webview";
import COLORS from "../../../constants/colors";
import { API_URL } from "../../../constants/api";
import { formatPublishDate } from "../../../lib/utils";
import { useAuthStore } from "../../../store/authStore";

export default function BookDetailPage() {
  const segments = useSegments();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);
  const [showFullScreenPdf, setShowFullScreenPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const { userClient, tokenClient, checkAuthClient } = useAuthStore();
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

  useEffect(() => {
    checkAuthClient();
  }, [segments]); // used for simulating in remove token

  useEffect(() => {
    const checkIfBookIsSaved = async () => {
      if(!userClient || !tokenClient) {
        return;
      }
       
      try {
        const response = await fetch(`${API_URL}/client/favorites/${id}/${userClient.id}`, {
          headers: { 
            Authorization: `Bearer ${tokenClient}` 
          },
        });
        const data = await response.json();

        if(!response.ok) { 
          throw new Error(data.message || "Failed to fetch favorite books!");
        }

        const isBookSaved = data.favoriteBook ? true : false;
        setIsSaved(isBookSaved);
      } 
      catch (error) {
        console.error("Error checking if book is saved:", error);
      }
    };

    checkIfBookIsSaved();
  }, [id, userClient, tokenClient]);

  const handleToggleSave = async () => {
    if(!userClient || !tokenClient) {
      Alert.alert("Login required", "You need to login to use this feature!");
      return;
    }
    setIsSaving(true);

    try {
      if(isSaved) {
        // remove from favorites
        const response = await fetch(`${API_URL}/client/favorites/${id}/${userClient.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tokenClient}`
          },
        });
        const data = await response.json();

        if(!response.ok) { 
          throw new Error(data.message || "Failed to remove books from favorites!");
        }

        setIsSaved(false);
      } 
      else {
        // add to favorites
        const dataSubmit = {
          clientId: userClient.id,
          bookId: id
        };

        const response = await fetch(`${API_URL}/client/favorites`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenClient}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataSubmit)
        });
        const data = await response.json();

        if(!response.ok) { 
          throw new Error(data.message || "Failed to save this book as favorites!");
        }

        setIsSaved(true);
      }
    } 
    catch(error) {
      console.error("Error toggling book save:", error);
      Alert.alert("Error", `Something went wrong. Please try again.`);
    } 
    finally {
      setIsSaving(false);
    }
  };

  const handleRateBook = (rating) => {
    if(!userClient || !tokenClient) {
      Alert.alert("Login required", "You need to login to rate this book!");
      return;
    }
    setUserRating(rating); // set rating for visual UI
    Alert.alert(
      "Rate this book",
      "This action cannot be undone. Are you sure you want to submit this rating?",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: async() => {
            setUserRating(null);
          }
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/client/ratings`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${tokenClient}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ ratingValue: rating, bookId: id }),
              });
              const data = await response.json();

              if(!response.ok) {
                throw new Error(data.message || "Failed to submit rating!");
              }

              Alert.alert("Submitted", "Thanks for your feedback!");
            } 
            catch(error) {
              Alert.alert("Error", error.message || "Failed to submit rating!");
            }
          },
        },
      ]
    );
  };

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

        <View style={styles.titleRow}>
          <Text style={styles.title}>{book.title}</Text>
          <TouchableOpacity
            onPress={handleToggleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={"#f4b400"} />
            ) : (
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={38}
                color={"#f4b400"}
              />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>
          Published {formatPublishDate(book.updatedAt)}
        </Text>
        <Text style={styles.caption}>{book.caption}</Text>
        <View style={styles.rating}>
          {Array.from({ length: 5 }).map((_, i) => {
            const rating = userRating || book.avgRating;
            const filled = Math.min(Math.max(rating - i, 0), 1); // between 0–1

            return (
              <TouchableOpacity key={i} onPress={() => handleRateBook(i + 1)}>
                <View>
                  {/* outline star */}
                  <Ionicons name="star-outline" size={22} color="#f4b400" style={{ marginRight: 2 }} />
                  {/* filled star clipped */}
                  <View style={{ 
                    position: "absolute", 
                    overflow: "hidden", 
                    width: 22 * filled, 
                    height: 22,
                    marginRight: 2 
                  }}>
                    <Ionicons name="star" size={22} color="#f4b400" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          <Text style={styles.numRatings}>{` (${book.ratingCount})`}</Text>
        </View>
        <Text style={styles.starDetail}>
          {`${book.avgRating.toFixed(1)} out of 5`}
        </Text>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.textPrimary,
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
  numRatings: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  starDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5
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