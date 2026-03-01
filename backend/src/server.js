import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

import authroutes from "./routes/auth.routes.js";
import messageroutes from "./routes/message.routes.js";
import ConnectDB from "./configs/connectdb.js";
import { app, server } from "./configs/socket.js";

dotenv.config();

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Routes
app.use("/api/auth", authroutes);
app.use("/api/message", messageroutes);

// Start server
server.listen(process.env.PORT || 5000, () => {
  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT || 5000}`,
  );
  ConnectDB();
});
