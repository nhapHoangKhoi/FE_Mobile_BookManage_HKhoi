import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../store/authStore";
import { Image } from "expo-image";
import styles from "../assets/styles/profile.styles";
import { formatMemberSince } from "../lib/utils";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import LogoutButton from "./LogoutButton";
import { Link } from "expo-router";

export default function ProfileHeader() {
  const { user } = useAuthStore();

  if(!user) return null;
  
  return (
    <View style={styles.profileHeader}>
      <Image 
        source={{ uri: user.profileImage }} 
        style={styles.profileImage} 
      />

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.memberSince}>
          Joined {formatMemberSince(user.createdAt)}
        </Text>
      </View>

      <View style={styles.groupButtonsProfile}>
        <Link href={`/admin/profile-edit/${user.id}`} asChild>
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={18} color={COLORS.white} />
            <Text style={styles.logoutText}>Edit</Text>
          </TouchableOpacity>
        
        </Link>
        <LogoutButton />
      </View>
    </View>
  );
}