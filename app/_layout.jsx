import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // handle navigation based on the authen state
  useEffect(() => {
    let isAuthRoute = false;
    let isSignedIn = false;

    if(segments.length > 0 && segments[0] === "(auth)") {
      isAuthRoute = true;
    }

    if(user && token) {
      isSignedIn = true;
    }

    console.log(">>> isAuthRoute: ", isAuthRoute);
    console.log(">>> isSignedIn: ", isSignedIn);

    if(!isSignedIn && !isAuthRoute) {
      console.log("Chay vao day 1")
      router.replace("/(auth)");
    }
    else if(isSignedIn && isAuthRoute) {
      console.log("Chay vao day 2")
      router.replace("/(tabs)");
    }
    console.log("-----------------");
  }, [user, token, segments]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" options={{title: "Page 1"}} />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}