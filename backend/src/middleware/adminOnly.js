import User from "../models/User.js";

export const adminOnly = async(req, res, next) => {
    try{
        const user = await User.findById(req.user).select("role").lean()

        if(!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" })
        }

        next();
    }catch(error) {
        res.status(500).json({ message: "Failed to verify admin access" })
    }
}