import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//JWT gneration
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  plan: user.plan,
  role: user.role,
  preferences: user.preferences,
});

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

    const normalizedEmail = String(email).toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User Already exists with this email" });
    }

    const user = await User.create({ name, email, password });
    console.log(`User created: ${user.email} (${user._id})`);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
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
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Logged in Successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan },
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
