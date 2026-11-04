import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppSettings from "../models/admin/AppSettings.js";

// Paths that must always work during maintenance (relative to /api)
const OPEN_PATHS = ["/auth", "/admin", "/health"];

export const maintenanceMode = async (req, res, next) => {
  try {
    if (OPEN_PATHS.some((p) => req.path.startsWith(p))) return next();

    const settings = await AppSettings.findOne({ key: "global" })
      .select("maintenanceMode")
      .lean();
    if (!settings?.maintenanceMode) return next();

    // Let admins through when they have a valid token
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("role").lean();
        if (user?.role === "admin") return next();
      } catch {
        // Invalid token: fall through to the maintenance response
      }
    }

    return res.status(503).json({
      message: "NoDucks is under maintenance. Please try again later.",
    });
  } catch (error) {
    next(error);
  }
};