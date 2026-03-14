import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://synq-app-rose.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const emitProfileUpdate = (updatedUser) => {
  io.emit("profileUpdated", updatedUser);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // send online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
