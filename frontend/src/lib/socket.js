import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: false,
  withCredentials: true,
});

export const connectSocket = (userId) => {
  if (!userId) return;

  socket.io.opts.query = { userId };

  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
