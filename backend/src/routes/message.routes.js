import express from "express";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import { rateLimitSummarization } from "../middlewares/rateLimiter.js";
import {
  getUsersforsidebar,
  getMessages,
  sendMessage,
  summarizeConversation,
  semanticSearchMessages,
  clearChat,
} from "../controllers/message.controllers.js";

const router = express.Router();

router.get("/users", isAuthorized, getUsersforsidebar);
router.get("/messages/:id", isAuthorized, getMessages);
router.post("/messages/send/:id", isAuthorized, sendMessage);

router.post(
  "/summarize/:id",
  isAuthorized,
  rateLimitSummarization,
  summarizeConversation,
);

router.get("/semantic-search/:id", isAuthorized, semanticSearchMessages);
router.delete("/clear/:id", isAuthorized, clearChat);

export default router;
