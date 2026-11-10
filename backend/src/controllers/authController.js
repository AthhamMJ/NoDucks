import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { getDefaultPlan } from "../services/settingsService.js";
import { sendVerificationOtp, sendVerificationLink } from "../services/verificationService.js";
import { generateToken, toSafeUser } from "../utils/auth.js";

//Register or SignUp
export const register = async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password length must be at least 6 characters" });
    }

    const normalizedEmail = String(email || "").toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User Already exists with this email" });          
    }
    const plan = await getDefaultPlan();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      plan,
      isVerified: false,
    });

    try {
      // Send 6-digit OTP code to the newly registered email
      const result = await sendVerificationOtp(user.email, req.ip);

      if (!result.ok) {
        // Rollback so the user isn't stuck
        await User.findByIdAndDelete(user._id);
        if (result.retryAfterSec) res.set("Retry-After", String(result.retryAfterSec));
        return res.status(429).json({
          message: "Too many requests. Please wait before trying again.",
          reason: result.reason,
          retryAfterSec: result.retryAfterSec,
        });
      }

      res.status(201).json({
        message: "Registration successful. Please enter the 6-digit verification code sent to your email.",
        email: user.email,
        requiresVerification: true,
      });
    } catch (emailError) {
      console.error("[Register] Error sending verification OTP:", emailError);
      // Rollback created user on critical error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        message: "Failed to send verification email. Please check email configuration.",
        error: emailError.message,
      });
    }
  } catch (error) {
    console.error("[Register] Internal error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || "").toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "This account is disabled" });
    }

    if (user.isVerified === false) {
      // Auto-trigger OTP send if not verified
      try {
        await sendVerificationOtp(user.email, req.ip);
      } catch (err) {
        console.warn("Could not auto-resend OTP on login:", err.message);
      }

      return res.status(403).json({
        message: "Please verify your email address to continue.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Logged in Successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        return res.status(400).json({ message: "Name connot be empty" });
      }
      updates.name = name;
    }

    //Only these preference keys can be changed
    const allowedPreferences = ["darkMode", "notifications", "language"];
    if (req.body.preferences) {
      for (const key of allowedPreferences) {
        if (req.body.preferences[key] !== undefined) {
          updates[`preferences.${key}`] = req.body.preferences[key];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: toSafeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete the current user
export const deleteMe = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user);
    if (!user) return res.status(404).json({ message: "User not Found" });
    res.json({ message: "Account Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
