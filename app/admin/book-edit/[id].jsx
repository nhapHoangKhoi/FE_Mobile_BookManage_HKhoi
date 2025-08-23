import { View, Text } from "react-native";
import { useLocalSearchParams, } from "expo-router";

export default function BookDetailPage() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Edit Screen: {id}</Text>
    </View>
  );
}