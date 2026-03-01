import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const onlineUsers = {};

export const getReceiverSocketId = (userId) => {
  return onlineUsers[userId];
};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    onlineUsers[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(onlineUsers));

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);

    if (userId) {
      delete onlineUsers[userId];
    }

    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });
});

export { app, server, io };
