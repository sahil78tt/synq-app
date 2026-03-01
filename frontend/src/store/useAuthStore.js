import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { connectSocket, disconnectSocket } from "../lib/socket";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoading: false,
  error: null,

  checkAuth: async () => {
    try {
      const { data } = await axiosInstance.get("/auth/me");

      set({ authUser: data, isCheckingAuth: false });

      connectSocket(data._id);
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

      connectSocket(data.user._id);

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

      connectSocket(data.user._id);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed.";
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  logout: () => {
    disconnectSocket();
    localStorage.removeItem("synq_token");
    set({ authUser: null });
  },
}));
