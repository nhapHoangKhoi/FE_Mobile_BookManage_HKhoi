import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";

export default function RootLayout() {
  // const router = useRouter();
  // const segments = useSegments();

  // const [isMounted, setIsMounted] = useState(false);

  // useEffect(() => {
  //   setIsMounted(true); // mark as mounted after first render
  // }, []);

  // // handle navigation based on the authen state
  // useEffect(() => {
  //   if(!isMounted) { // prevent navigating before mount
  //     return;
  //   }
  // }, [segments, isMounted]);

  const { checkAuth, token } = useAuthStore();
  // const segments = useSegments(); // another way better for optimization

  useEffect(() => {
    // console.log("Chay vo day"); // used for simulating in remove token
    checkAuth();
  }, [
    // segments // another way better for optimization
  ]);
  // console.log(">>> Chay o root"); // used for simulating in remove token
  // console.log(token); // used for simulating in remove token
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={token}>
            <Stack.Screen name="admin/(tabs)" options={{title: "Page 1"}} /> 
          </Stack.Protected>

          <Stack.Protected guard={!token}>
            <Stack.Screen name="client/(tabs)" /> 
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}