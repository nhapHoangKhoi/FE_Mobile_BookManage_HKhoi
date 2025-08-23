import { Text, TouchableOpacity, Alert } from "react-native";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

export default function LogoutClientButton() {
  const { logoutClient } = useAuthStore();

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Logout", onPress: () => logoutClient(), style: "destructive" },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <TouchableOpacity 
      style={styles.logoutButton} 
      onPress={confirmLogout}
    >
      <Ionicons name="log-out-outline" size={18} color={COLORS.white} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}