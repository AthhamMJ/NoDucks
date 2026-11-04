import mongoose from "mongoose";
import User from "../../models/User.js";
import Task from "../../models/Task.js";
import Lesson from "../../models/Lesson.js";
import Chat from "../../models/Chat.js";
import AiUsage from "../../models/admin/AiUsage.js";
import Note from "../../models/Note.js";
import Subject from "../../models/Subject.js";

export const getUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 20, 100));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Failed to load users" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { plan, role, isActive } = req.body;

    const allowed = {};
    if (plan !== undefined) {
      if (!["free", "student"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      allowed.plan = plan;
    }
    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      //Changing the Object into a String
      const currentUserId = req.user?._id
        ? String(req.user._id)
        : String(req.user);
      if (id === currentUserId && role !== "admin") {
        return res
          .status(400)
          .json({ message: "You can't remove your Own admin Role" });
      }
      allowed.role = role;
    }
    if(isActive !== undefined){
      if(typeof isActive !== "boolean"){
        return res.status(400).json({message: "isActive must be true or false"})
      }
      if(id === String(req.user._id) && isActive === false){
        return res.status(400).json({message: "You can't disable your own Account"})
      }
      allowed.isActive = isActive;
    }

    if (Object.keys(allowed).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const user = await User.findByIdAndUpdate(id, allowed, {
      new: true,
      runValidators: true,
    })

      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("updateUser error found", error);
    res.status(500).json({ message: "Failed to update the user" });
  }
};

// export const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     //Prevent [object] : [object] problem. Because req.user is { _id: "..." }, String(req.user) returns "[object Object]"
//     const currentUserId = req.user?._id
//       ? String(req.user._id)
//       : String(req.user);

//     if (id === currentUserId) {
//       return res.status(400).json({
//         message: "You can't destruct your own Admin account yourself",
//       });
//     }

//     const user = await User.findByIdAndDelete(id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     await Promise.all([
//       Task.deleteMany({ user: id }),
//       Note.deleteMany({ user: id }),
//       Subject.deleteMany({ user: id }),
//       Lesson.deleteMany({ userId: id }),
//       Chat.deleteMany({ userId: id }),
//       AiUsage.deleteMany({ userId: id }),
//     ]);
//     res.json({ message: "User deleted" });
//   } catch (error) {
//     console.error("deleteUser error:", error);
//     res.status(500).json({ message: "Failed to delete the user" });
//   }
// };
