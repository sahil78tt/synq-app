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

  setSelectedChat: async (chat) => {
    set({ selectedChat: chat, messages: [] });
    if (chat) {
      await get().fetchMessages(chat._id);
    }
  },

  fetchConversations: async () => {
    try {
      set({ isLoadingConversations: true });
      const { data } = await axiosInstance.get("/message/users");
      set({ conversations: data, isLoadingConversations: false });

      // 🔥 listen profile updates for sidebar users
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
}));
