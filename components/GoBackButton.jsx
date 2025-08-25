import { Ionicons } from "@expo/vector-icons";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import COLORS from "../constants/colors";
import { useRouter } from "expo-router";

export default function GoBackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => router.back()}
    >
      <Ionicons name="arrow-back" size={24} color={COLORS.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
    marginBottom: 13
  },
});