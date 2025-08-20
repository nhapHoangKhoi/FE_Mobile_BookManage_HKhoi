import { View, Text, ActivityIndicator } from "react-native";
import COLORS from "../constants/colors";

export default function LoaderSpinner({ size = "large", color = "#ff0000" }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}