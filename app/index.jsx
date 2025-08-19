import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useAuthStore } from  "../store/authStore";
import { useEffect } from "react";

export default function Index() {
  const { user, token, checkAuth } = useAuthStore();

  console.log(">>> user: ", user);
  console.log(">>> token: ", token);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello world</Text>
      <Link href="/(auth)/signup">Signup</Link>
      <Link href="/(auth)">Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "blue"
  }
});