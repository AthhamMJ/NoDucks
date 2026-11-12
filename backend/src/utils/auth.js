import jwt from "jsonwebtoken";

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  plan: user.plan,
  role: user.role,
  isVerified: user.isVerified,
  preferences: user.preferences,
});