import { io } from "socket.io-client";

// socket instance (single)
export const socket = io("http://localhost:5000", {
  autoConnect: false,
  withCredentials: true,
});

// 🔥 Connect socket with userId
export const connectSocket = (userId) => {
  if (!userId) return;

  // attach userId as query param
  socket.io.opts.query = { userId };

  if (!socket.connected) {
    socket.connect();
  }
};

// 🔥 Disconnect socket safely
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
