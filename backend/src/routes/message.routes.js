import express from "express";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import {
  getUsersforsidebar,
  getMessages,
  sendMessages,
} from "../controllers/message.controllers.js";
const router = express.Router();

router.get("/users", isAuthorized, getUsersforsidebar);
router.get("/messages/:id", isAuthorized, getMessages);
router.post("/messages/send/:id", isAuthorized, sendMessages);
export default router;
