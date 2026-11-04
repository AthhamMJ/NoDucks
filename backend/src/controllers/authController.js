import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { getDefaultPlan } from "../services/settingsService.js";
import { sendVerificationLink } from "../services/verificationService.js";
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
      const result = await sendVerificationLink(user.email, req.ip);

      if (!result.ok) {
        // Rollback so the user isn't stuck
        await User.findByIdAndDelete(user._id);
        if (result.retryAfterSec) res.set("Retry-After", result.retryAfterSec);
        return res.status(429).json({
          message: "Too many requests. Please wait before trying again.",
          reason: result.reason,
          retryAfterSec: result.retryAfterSec,
        });
      }
    } catch (emailError) {
      // Rollback on email sending failure
      await User.findByIdAndDelete(user._id);
      throw emailError;
    }
  } catch (error) {
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

    const user = await User.findOne({ email });
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
