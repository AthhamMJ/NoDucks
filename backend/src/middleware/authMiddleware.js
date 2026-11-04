import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }

  // Split "Bearer <token>" into ["Bearer", "<token>"]
  let decoded;
  try {
    const token = header.split(" ")[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token is invalid or expired",
    });
  }

  // So the other controllers can use req.user to know who is calling
  req.user = { _id: decoded.id };

  try {
    const user = await User.findById(decoded.id).select("isActive").lean();

    if (user.isActive === false) {
      return res.status(403).json({ message: "This account is disabled" });
    }

    next();
  } catch (error) {
    console.error("protect error:", error);
    res.status(500).json({ message: "Failed to verify account" });
  }
};

//So the other controllers could use the req.user to know if this user is valid (Authored)
