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

  fetchSummary: async () => {
    const { selectedChat } = get();
    if (!selectedChat) return;

    try {
      set({ isSummarizing: true });
      const { data } = await axiosInstance.post(
        `/message/summarize/${selectedChat._id}`,
      );
      set({ summary: data.summary, isSummarizing: false });
    } catch (error) {
      set({ isSummarizing: false, summary: null });
    }
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
