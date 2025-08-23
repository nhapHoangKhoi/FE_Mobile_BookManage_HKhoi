import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true, // ARE we CHECKING the authenticaion? 
  userClient: null,
  tokenClient: null,

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const dataFinal = {
        username: username,
        email: email,
        password: password
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      });
      const data = await response.json();

      if(!response.ok) { 
        throw new Error(data.message || "Something went wrong");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ 
        token: data.token, 
        user: data.user, 
        isLoading: false 
      });
      return { success: true };
    } 
    catch(error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const dataFinal = {
        email: email,
        password: password
      };

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      });
      const data = await response.json();

      if(!response.ok) { 
        throw new Error(data.message || "Something went wrong");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ 
        token: data.token, 
        user: data.user, 
        isLoading: false 
      });

      return { success: true };
    } 
    catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      set({ 
        token: token, 
        user: user
      });
    } 
    catch (error) {
      console.log("Auth check failed", error);
    } 
    finally { // always
      set({ isCheckingAuth: false }); // run down to this line, it means check finished
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ 
      token: null, 
      user: null 
    });
  },

  registerClient: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const dataFinal = {
        username: username,
        email: email,
        password: password
      };

      const response = await fetch(`${API_URL}/client/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      });
      const data = await response.json();

      if(!response.ok) { 
        throw new Error(data.message || "Something went wrong");
      }

      await AsyncStorage.setItem("userClient", JSON.stringify(data.user));
      await AsyncStorage.setItem("tokenClient", data.token);

      set({ 
        tokenClient: data.token, 
        userClient: data.user, 
        isLoading: false 
      });
      return { success: true };
    } 
    catch(error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  loginClient: async (email, password) => {
    set({ isLoading: true });

    try {
      const dataFinal = {
        email: email,
        password: password
      };

      const response = await fetch(`${API_URL}/client/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      });
      const data = await response.json();

      if(!response.ok) { 
        throw new Error(data.message || "Something went wrong");
      }

      await AsyncStorage.setItem("userClient", JSON.stringify(data.user));
      await AsyncStorage.setItem("tokenClient", data.token);

      set({ 
        tokenClient: data.token, 
        userClient: data.user, 
        isLoading: false 
      });

      return { success: true };
    } 
    catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logoutClient: async () => {
    await AsyncStorage.removeItem("tokenClient");
    await AsyncStorage.removeItem("userClient");
    set({ 
      tokenClient: null, 
      userClient: null 
    });
  },

  checkAuthClient: async () => {
    try {
      const token = await AsyncStorage.getItem("tokenClient");
      const userJson = await AsyncStorage.getItem("userClient");
      const user = userJson ? JSON.parse(userJson) : null;

      set({ 
        tokenClient: token, 
        userClient: user
      });
    } 
    catch (error) {
      console.log("Auth check failed", error);
    } 
    finally { // always
      set({ isCheckingAuth: false }); // run down to this line, it means check finished
    }
  },
}));