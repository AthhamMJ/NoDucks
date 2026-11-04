import User from "../models/User.js";
import { sendVerificationLink, consumeVerificationToken } from "../services/verificationService.js";
import { generateToken, toSafeUser } from "../utils/auth.js";

// POST /auth/verify-email  { token }
export const verifyEmail = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const record = await consumeVerificationToken(token);
    if (!record) {
      return res.status(400).json({ message: "This link is invalid or has expired." });
    }

    const user = await User.findOneAndUpdate(
      { email: record.email },
      { $set: { isVerified: true } },
      { new: true },
    );
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({
      message: "Email verified",
      token: generateToken(user._id),
      user: toSafeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// POST /auth/resend-verification  { email }
export const resendVerification = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const genericResponse = { message: "If this email can receive a link, we sent one." };

    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.json(genericResponse);
    }

    const result = await sendVerificationLink(email, req.ip);
    if (!result.ok) {
      if (result.retryAfterSec) res.set("Retry-After", result.retryAfterSec);
      return res.status(429).json({
        message: "Too many requests. Please wait before trying again.",
        reason: result.reason,
        retryAfterSec: result.retryAfterSec,
      });
    }

    res.json(genericResponse);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};