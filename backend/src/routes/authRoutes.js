import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  deleteMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPasswordWithOtp,
  verifyEmail,
  resendVerification,
} from "../controllers/verificationController.js";

const router = express.Router();

// Primary auth endpoints
router.post("/register", register);
router.post("/login", login);

// Current user endpoints
router
  .route("/me")
  .get(protect, getMe)
  .patch(protect, updateMe)
  .delete(protect, deleteMe);

// 6-digit OTP Email Verification
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Forgot Password & Reset via OTP
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithOtp);

// Legacy link-based verification
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

export default router;
