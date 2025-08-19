import { Platform } from "react-native";

let API_URL = "";

if (__DEV__) {
  // development
  // API_URL = "http://vscodeConsole:4000/api"; // use your WiFi IP if testing on a real phone

  if(Platform.OS === "android") {
    API_URL = "http://10.0.2.2:4000/api"; // Android Emulator
  } 
  else {
    API_URL = "http://localhost:4000/api"; // iOS simulator
  }
} 
else {
  // production (deployed backend)
  API_URL = "https://your-api.example.com/api";
}

export { API_URL };