import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    checkAuth();
    setIsMounted(true); // mark as mounted after first render
  }, []);

  // handle navigation based on the authen state
  useEffect(() => {
    if(!isMounted) { // prevent navigating before mount
      return;
    }

    let isAuthRoute = false;
    let isSignedIn = false;

    if(segments.length > 0 && segments[0] === "(auth)") {
      isAuthRoute = true;
    }

    if(user && token) {
      isSignedIn = true;
    }

    if(!isSignedIn && !isAuthRoute) {
      router.replace("/(auth)");
    }
    else if(isSignedIn && isAuthRoute) {
      router.replace("/(tabs)");
    }
  }, [user, token, segments, isMounted]);

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