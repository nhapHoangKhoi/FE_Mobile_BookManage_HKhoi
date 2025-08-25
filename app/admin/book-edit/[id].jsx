import { useEffect, useState } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSegments } from "expo-router";
import styles from "../../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../../constants/colors";
import { useAuthStore } from "../../../store/authStore";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from "../../../constants/api";
import { useLocalSearchParams, } from "expo-router";
import { sleep } from "../../../lib/utils";
import GoBackButton from "../../../components/GoBackButton";

export default function EditBookPage() {
  const { id } = useLocalSearchParams();
  const segments = useSegments();
  const [bookDetail, setBookDetail] = useState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(3);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [image, setImage] = useState(null); // display the selected image
  const [file, setFile] = useState(null);

  const { token, checkAuth } = useAuthStore();

  const fetchBookDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch detailed book!");
      }

      setBookDetail(data.bookDetail);
    } 
    catch (err) {
      console.error("Error fetching book:", err);
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetail();
  }, []);

  useEffect(() => {
    if(bookDetail) {
      setTitle(bookDetail.title || "");
      setDescription(bookDetail.description || "");
      setRating(bookDetail.avgRating || 3);
      setImage(bookDetail.image || null);
      
      if(bookDetail.fileBook) {
        const fileName = bookDetail.fileBook.split("/").pop();
        setFile({
          uri: bookDetail.fileBook,
          name: fileName,
          type: "application/pdf",
        });
      }
    }
  }, [bookDetail]);

  // const renderRatingPicker = () => {
  //   const stars = [];
  //   for(let i = 1; i <= 5; i++) {
  //     stars.push(
  //       <TouchableOpacity 
  //         key={i} 
  //         onPress={() => setRating(i)} 
  //         style={styles.starButton}
  //       >
  //         <Ionicons
  //           name={i <= rating ? "star" : "star-outline"}
  //           size={32}
  //           color={i <= rating ? "#f4b400" : COLORS.textSecondary}
  //         />
  //       </TouchableOpacity>
  //     );
  //   }
  //   return (
  //     <View style={styles.ratingContainer}>
  //       {stars}
  //     </View>
  //   );
  // };

  const renderRatingPicker = (rating) => {
    return (
      <View style={[styles.ratingContainer, { opacity: 0.4, backgroundColor: "#505050" }]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = Math.min(Math.max(rating - i, 0), 1); // 0–1

          return (
            <View key={i} style={{ padding: 8 }}>
              <View  style={{ position: "relative"}}>
                {/* outline star */}
                <Ionicons name="star-outline" size={32} color="#f4b400" />
                {/* filled star clipped */}
                <View
                  style={{
                    position: "absolute",
                    overflow: "hidden",
                    width: 32 * filled,
                    height: 32,
                  }}
                >
                  <Ionicons name="star" size={32} color="#f4b400" />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const chooseImage = async () => {
    try {
      // request permission if needed
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if(status !== "granted") {
        Alert.alert(
          "Permission Denied", 
          "We need camera roll permissions to upload an image");
        return;
      }

      // open image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // lower quality
      });

      if(!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } 
    catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };

  const chooseFile = async () => {
    try {
      // open file explorer
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if(result.canceled) {
        return;
      }

      const fileAsset = result.assets[0];
      setFile(fileAsset);
    } 
    catch (error) {
      console.error("Error picking PDF:", error);
      Alert.alert("Error", "Could not pick file!");
    }
  };

  const handleSubmit = async () => {
    if(!title || !description || !image || !rating || !file) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("rating", rating.toString());

      if(image && !image.startsWith("https://res.cloudinary.com/")) {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];
        const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
        formData.append("image", {
          uri: image, // file path from expo-image-picker
          name: `upload.${fileType}`, // any name
          type: imageType, // mime type
        });
      }

      if(file && !file.uri.startsWith("https://res.cloudinary.com/")) {
        formData.append("fileBook", {
          uri: file.uri, // just different style of writing code, actually 100% the same
          name: file.name,
          type: "application/pdf",
        });
      }

      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();

      if(!response.ok) { 
        throw new Error(data.message || "Something went wrong");
      }

      Alert.alert("Success", "Book updated successfully!", [
        {
          text: "OK",
          onPress: async () => {
            // clear temporarily to show reload feeling
            setTitle("");
            setDescription("");
            setImage(null);
            setRating(null);
            setFile(null);

            await fetchBookDetail(); // after alert, automatically reload to get new info
          },
        },
      ]);
    } 
    catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } 
    finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(500); // delay first then fetchData
    await fetchBookDetail();
    setRefreshing(false);
  };

  useEffect(() => {
    checkAuth();
  }, [segments]); // used for simulating in remove token

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        style={styles.scrollViewStyle}
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
      >
        <View style={styles.card}>
          <GoBackButton />
          <View style={styles.header}>
            <Text style={styles.title}>Edit Book</Text>
            <Text style={styles.subtitle}>Update your books</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ratings</Text>
              {bookDetail && (
                <>
                  {renderRatingPicker(bookDetail.avgRating)}
                </>
              )}
            </View>

            {/* image */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity 
                style={styles.imagePicker} 
                onPress={chooseImage}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Tap to select image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Short descriptions..."
                placeholderTextColor={COLORS.placeholderText}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {/* pdf */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>PDF file</Text>
              <TouchableOpacity 
                style={styles.filePicker} 
                onPress={chooseFile}
              >
                {file ? (
                  <View style={styles.fileInfo}>
                    <Ionicons name="document-text-outline" size={28} color={COLORS.primary} />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="document-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Tap to select a pdf file</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Update</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}