import User from "../models/User.js";

export const adminOnly = async(req, res, next) => {
    try{
        const userId = req.user?._id || req.user
        const user = await User.findById(userId).select("role").lean()

        if(!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" })
        }

        next();
    }catch(error) {
        res.status(500).json({ message: "admin Only", error })
    }
}