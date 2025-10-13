// routes/authRoutes.js
import express from "express";
import {
  signUp,
  login,
  logOut,
  checkUser,
  verifyOTP,
  forgotPassword,
  resetPassword,
  cleanupOTPs,
  resendOTP,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/protectRoute.js";
import { adminAuthorization } from "../middleware/adminAuthorization.js";

const router = express.Router();

// Public routes
router.post("/signup", signUp);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logOut);

// Protected routes
router.get("/checkUser", protectRoute, checkUser);

// Admin only routes
router.post("/cleanup-otps", protectRoute, adminAuthorization, cleanupOTPs);

export default router;