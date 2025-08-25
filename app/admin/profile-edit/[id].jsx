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
import { API_URL } from "../../../constants/api";
import { useLocalSearchParams, } from "expo-router";
import { sleep } from "../../../lib/utils";
import GoBackButton from "../../../components/GoBackButton";

export default function EditBookPage() {
  const { id } = useLocalSearchParams();
  const segments = useSegments();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [image, setImage] = useState(null); // display the selected image

  const { user, token, checkAuth } = useAuthStore();

  // const fetchBookDetail = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/books/${id}`, {
  //       headers: { 
  //         Authorization: `Bearer ${token}` 
  //       },
  //     });
  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || "Failed to fetch detailed book!");
  //     }

  //     setBookDetail(data.bookDetail);
  //   } 
  //   catch (err) {
  //     console.error("Error fetching book:", err);
  //   } 
  //   finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchBookDetail();
  // }, []);

  useEffect(() => {
    if(user) {
      setUsername(user.username || "");
      // setImage(bookDetail.image || null);
    }
  }, [user]);

  // const chooseImage = async () => {
  //   try {
  //     // request permission if needed
  //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  //     if(status !== "granted") {
  //       Alert.alert(
  //         "Permission Denied", 
  //         "We need camera roll permissions to upload an image");
  //       return;
  //     }

  //     // open image library
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ["images"],
  //       allowsEditing: true,
  //       aspect: [4, 3],
  //       quality: 0.5, // lower quality
  //     });

  //     if(!result.canceled) {
  //       setImage(result.assets[0].uri);
  //     }
  //   } 
  //   catch (error) {
  //     console.error("Error picking image:", error);
  //     Alert.alert("Error", "There was a problem selecting your image");
  //   }
  // };

  const handleSubmit = async () => {
    if(!username) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // FormData
      // const formData = new FormData();
      // formData.append("username", username);

      // if(image && !image.startsWith("https://res.cloudinary.com/")) {
      //   const uriParts = image.split(".");
      //   const fileType = uriParts[uriParts.length - 1];
      //   const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
      //   formData.append("image", {
      //     uri: image, // file path from expo-image-picker
      //     name: `upload.${fileType}`, // any name
      //     type: imageType, // mime type
      //   });
      // }

      const response = await fetch(`${API_URL}/accounts/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username })
      });
      const data = await response.json();

      if(!response.ok) { 
        throw new Error(data.message || "Something went wrong");
      }

      Alert.alert("Success", "Admin profile updated successfully!", [
        {
          text: "OK",
          onPress: async () => {
            // clear temporarily to show reload feeling
            setUsername("");
            // setImage(null);

            await checkAuth(); // after alert, automatically reload to get new info
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
    await checkAuth();
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
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update profile information</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  placeholderTextColor={COLORS.placeholderText}
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            {/* image */}
            {/* <View style={styles.formGroup}>
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
            </View> */}

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