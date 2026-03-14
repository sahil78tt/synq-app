import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { socket } from "../lib/socket";

export const useChatStore = create((set, get) => ({
  selectedChat: null,
  messages: [],
  conversations: [],
  onlineUsers: [],
  isLoadingMessages: false,
  isLoadingConversations: false,
  isSending: false,
  summary: null,
  isSummarizing: false,
  searchQuery: "",
  searchResults: [],
  isSearching: false,

  // Typing indicator state
  isTyping: false,
  typingUserId: null,

  // Delete modal state
  isDeleteModalOpen: false,
  deleteForBoth: false,
  isDeleting: false,

  // ✅ NEW: Rate limit state for summarization
  summaryError: null, // { message: string, retryAfter: number, isRateLimited: boolean }
  rateLimitResetTime: null, // Timestamp when rate limit resets

  setTyping: (userId) => {
    set({ isTyping: true, typingUserId: userId });
  },

  clearTyping: () => {
    set({ isTyping: false, typingUserId: null });
  },

  // Delete modal actions
  openDeleteModal: () => {
    set({ isDeleteModalOpen: true, deleteForBoth: false });
  },

  closeDeleteModal: () => {
    set({ isDeleteModalOpen: false, deleteForBoth: false });
  },

  setDeleteForBoth: (value) => {
    set({ deleteForBoth: value });
  },

  clearChat: async () => {
    const { selectedChat, deleteForBoth } = get();
    if (!selectedChat) return;

    try {
      set({ isDeleting: true });

      await axiosInstance.delete(`/message/clear/${selectedChat._id}`, {
        data: { deleteForBoth },
      });

      set({
        messages: [],
        summary: null,
        searchResults: [],
        searchQuery: "",
        isDeleteModalOpen: false,
        deleteForBoth: false,
        isDeleting: false,
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
      set({ isDeleting: false });
    }
  },

  setSelectedChat: async (chat) => {
    set({
      selectedChat: chat,
      messages: [],
      summary: null,
      searchQuery: "",
      searchResults: [],
      isTyping: false,
      typingUserId: null,
      isDeleteModalOpen: false,
      deleteForBoth: false,
      // ✅ Clear summary error when switching chats
      summaryError: null,
    });
    if (chat) {
      await get().fetchMessages(chat._id);
    }
  },

  fetchConversations: async () => {
    try {
      set({ isLoadingConversations: true });
      const { data } = await axiosInstance.get("/message/users");
      set({ conversations: data, isLoadingConversations: false });

      socket.on("profileUpdated", (updatedUser) => {
        const updatedList = get().conversations.map((user) =>
          user._id === updatedUser._id ? updatedUser : user,
        );

        set({ conversations: updatedList });

        const current = get().selectedChat;
        if (current && current._id === updatedUser._id) {
          set({ selectedChat: updatedUser });
        }
      });
    } catch (error) {
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (userId) => {
    try {
      set({ isLoadingMessages: true });
      const { data } = await axiosInstance.get(`/message/messages/${userId}`);
      set({ messages: data, isLoadingMessages: false });
    } catch (error) {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content) => {
    const { selectedChat, messages } = get();
    if (!selectedChat) return;

    try {
      set({ isSending: true });

      const { data } = await axiosInstance.post(
        `/message/messages/send/${selectedChat._id}`,
        content,
      );

      set({
        messages: [...messages, data],
        isSending: false,
      });
    } catch (error) {
      set({ isSending: false });
    }
  },

  addMessage: (message) => {
    const { selectedChat, messages } = get();

    if (!selectedChat) return;

    const belongsToCurrentChat =
      message.senderId === selectedChat._id ||
      message.receiverId === selectedChat._id;

    if (!belongsToCurrentChat) return;

    const exists = messages.some((msg) => msg._id === message._id);
    if (exists) return;

    set({ messages: [...messages, message] });
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },

  // ✅ UPDATED: fetchSummary with rate limit handling
  fetchSummary: async () => {
    const { selectedChat, rateLimitResetTime } = get();
    if (!selectedChat) return;

    // Check if still rate limited
    if (rateLimitResetTime && Date.now() < rateLimitResetTime) {
      const secondsLeft = Math.ceil((rateLimitResetTime - Date.now()) / 1000);
      const minutesLeft = Math.ceil(secondsLeft / 60);
      set({
        summaryError: {
          message: `Rate limit active. Please wait ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
          retryAfter: secondsLeft,
          isRateLimited: true,
        },
      });
      return;
    }

    try {
      set({ isSummarizing: true, summaryError: null });
      const { data } = await axiosInstance.post(
        `/message/summarize/${selectedChat._id}`,
      );
      set({
        summary: data.summary,
        isSummarizing: false,
        summaryError: null,
        rateLimitResetTime: null,
      });
    } catch (error) {
      // ✅ Handle 429 Rate Limit Error
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        const retryAfter = errorData.retryAfter || 900; // Default 15 minutes
        const resetTime = Date.now() + retryAfter * 1000;

        set({
          isSummarizing: false,
          summary: null,
          summaryError: {
            message:
              errorData.message ||
              "Rate limit exceeded. Please try again later.",
            retryAfter: retryAfter,
            isRateLimited: true,
            limit: errorData.limit || 5,
            windowMinutes: errorData.windowMinutes || 15,
          },
          rateLimitResetTime: resetTime,
        });
      } else {
        // Handle other errors
        set({
          isSummarizing: false,
          summary: null,
          summaryError: {
            message:
              error.response?.data?.message ||
              "Failed to generate summary. Please try again.",
            isRateLimited: false,
          },
        });
      }
    }
  },

  // ✅ NEW: Clear summary error
  clearSummaryError: () => {
    set({ summaryError: null });
  },

  // ✅ NEW: Check if currently rate limited
  isRateLimited: () => {
    const { rateLimitResetTime } = get();
    return rateLimitResetTime && Date.now() < rateLimitResetTime;
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (!query || query.trim() === "") {
      set({ searchResults: [] });
    }
  },

  semanticSearch: async (query) => {
    const { selectedChat } = get();
    if (!selectedChat || !query || query.trim() === "") {
      set({ searchResults: [], searchQuery: "" });
      return;
    }

    try {
      set({ isSearching: true, searchQuery: query });
      const { data } = await axiosInstance.get(
        `/message/semantic-search/${selectedChat._id}?q=${encodeURIComponent(query)}`,
      );
      set({ searchResults: data.results || [], isSearching: false });
    } catch (error) {
      console.error("Semantic search error:", error);
      set({ isSearching: false, searchResults: [] });
    }
  },

  clearSearch: () => {
    set({ searchQuery: "", searchResults: [] });
  },
}));
