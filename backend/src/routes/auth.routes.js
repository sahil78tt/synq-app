import express from "express";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import {
  login,
  signup,
  logout,
  updateProfile,
  checkAuth,
  googleAuth,
} from "../controllers/auth.controllers.js";

const router = express.Router();

// Auth routes
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.post("/google", googleAuth);

// Protected routes
router.get("/me", isAuthorized, checkAuth);
router.put("/update-profile", isAuthorized, updateProfile);

export default router;
