import { Redirect } from "expo-router";

export default function AppIndex() {
  // return <Redirect href="/admin/(tabs)" />;
  // return <Redirect href="/(auth)" />;
  return <Redirect href="/client/(tabs)" />;
}