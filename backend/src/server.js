import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import authroutes from "./routes/auth.routes.js";
import messageroutes from "./routes/message.routes.js";
import ConnectDB from "./configs/connectdb.js";
import { app, server } from "./configs/socket.js";

dotenv.config();

// Allowed origins
const allowedOrigins = [
  process.env.CORS_ORIGIN, // production frontend (Vercel)
  "http://localhost:5173", // local development
];

// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Routes
app.use("/api/auth", authroutes);
app.use("/api/message", messageroutes);

// Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  ConnectDB();
});
