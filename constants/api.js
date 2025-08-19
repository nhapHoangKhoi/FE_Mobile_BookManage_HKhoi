import { Platform } from "react-native";

let API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api` || "";

if (__DEV__) {
  // development
  // API_URL = "http://vscodeConsole:4000/api"; // use your WiFi IP if testing on a real phone
  API_URL = `http://${process.env.EXPO_PUBLIC_WIFI_ADDRESS}:4000/api`;

  if(Platform.OS === "android") {
    API_URL = "http://10.0.2.2:4000/api"; // Android Emulator
  } 
  // else {
  //   API_URL = "http://localhost:4000/api"; // iOS simulator
  // }
} 
else {
  // production
  API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`; // deployed backend
}

export { API_URL };