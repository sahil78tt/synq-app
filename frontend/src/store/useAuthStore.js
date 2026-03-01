import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoading: false,
  error: null,

  checkAuth: async () => {
    try {
      const { data } = await axiosInstance.get("/auth/me");
      set({ authUser: data, isCheckingAuth: false });
    } catch {
      localStorage.removeItem("synq_token");
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.post("/auth/login", credentials);
      localStorage.setItem("synq_token", data.token);
      set({ authUser: data.user, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.post("/auth/signup", payload);
      localStorage.setItem("synq_token", data.token);
      set({ authUser: data.user, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed.";
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // 🔥 ADD THIS FUNCTION
  updateProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.put("/auth/update-profile", payload);

      // assuming backend returns updated user
      set({ authUser: data, isLoading: false });

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Update failed.";
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem("synq_token");
    set({ authUser: null });
  },
}));
