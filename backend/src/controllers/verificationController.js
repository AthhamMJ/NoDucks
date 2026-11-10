import User from "../models/User.js";
import {
  sendVerificationOtp,
  consumeOtp,
  sendPasswordResetOtp,
  sendVerificationLink,
  consumeVerificationToken,
} from "../services/verificationService.js";
import { generateToken, toSafeUser } from "../utils/auth.js";

// POST /auth/verify-otp { email, otp }
export const verifyOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and 6-digit OTP code are required." });
    }

    const record = await consumeOtp(email, otp, "email_verification");
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { isVerified: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json({
      message: "Email successfully verified.",
      token: generateToken(user._id),
      user: toSafeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// POST /auth/resend-otp { email }
export const resendOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak registered status, respond with generic message
      return res.json({ message: "If this email is registered, a code has been sent." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified. Please sign in." });
    }

    const result = await sendVerificationOtp(email, req.ip);
    if (!result.ok) {
      if (result.retryAfterSec) res.set("Retry-After", String(result.retryAfterSec));
      return res.status(429).json({
        message: "Please wait before requesting another code.",
        retryAfterSec: result.retryAfterSec,
      });
    }

    res.json({ message: "Verification code sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// POST /auth/forgot-password { email }
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    // Always return safe generic confirmation to prevent user enumeration
    if (!user) {
      return res.json({
        message: "If an account exists with this email, a reset code has been sent.",
      });
    }

    const result = await sendPasswordResetOtp(email, req.ip);
    if (!result.ok) {
      if (result.retryAfterSec) res.set("Retry-After", String(result.retryAfterSec));
      return res.status(429).json({
        message: "Please wait before requesting another reset code.",
        retryAfterSec: result.retryAfterSec,
      });
    }

    res.json({
      message: "If an account exists with this email, a reset code has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// POST /auth/reset-password { email, otp, newPassword }
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, verification code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const record = await consumeOtp(email, otp, "password_reset");
    if (!record) {
      return res.status(400).json({
        message: "Invalid or expired reset code.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Assign new password; mongoose pre('save') hook handles salt and bcrypt hashing
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password reset successful. You can now sign in with your new password.",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Legacy URL Token Verification (POST /auth/verify-email)
export const verifyEmail = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    const record = await consumeVerificationToken(token);
    if (!record) {
      return res.status(400).json({ message: "This link is invalid or has expired." });
    }

    const user = await User.findOneAndUpdate(
      { email: record.email },
      { $set: { isVerified: true } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    res.json({
      message: "Email verified.",
      token: generateToken(user._id),
      user: toSafeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Legacy Link Resend (POST /auth/resend-verification)
export const resendVerification = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const genericResponse = { message: "If this email can receive a link, we sent one." };

    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.json(genericResponse);
    }

    const result = await sendVerificationLink(email, req.ip);
    if (!result.ok) {
      if (result.retryAfterSec) res.set("Retry-After", String(result.retryAfterSec));
      return res.status(429).json({
        message: "Too many requests. Please wait before trying again.",
        retryAfterSec: result.retryAfterSec,
      });
    }

    res.json(genericResponse);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
