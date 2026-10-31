import mongoose, { mongo } from "mongoose";
import User from "../models/User.js";
import Task from "../models/Task.js";
import AiUsage from "../models/AiUsage.js";
import Lesson from "../models/Lesson.js";
import Chat from "../models/Chat.js";
import Note from "../models/Note.js";
import Subject from "../models/Subject.js";
import { currentPeriod } from "../config/aiQuotas.js";

export const getOverview = async (req, res) => {
  try {
    const period = currentPeriod();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsers, newUsers, totalTasks, aiTotals] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Task.countDocuments(),
      AiUsage.aggregate([
        { $match: { period } },
        {
          $group: {
            _id: null,
            aiUsers: { $sum: 1 },
            aiRequests: {
              $sum: {
                $add: [
                  { $ifNull: ["$lessons", 0] },
                  { $ifNull: ["$chats", 0] },
                  { $ifNull: ["$quizzes", 0] },
                ],
              },
            },
            aiErrors: { $sum: { $ifNull: ["$failures", 0] } },
          },
        },
      ]),
    ]);

    const ai = aiTotals[0] || { aiUsers: 0, reRequests: 0, aiError: 0 };

    res.json({
      stats: {
        totalUsers,
        newUsers7d: newUsers,
        totalTasks,
        aiUsersThisMonth: ai.aiUsers,
        aiRequestsThisMonth: ai.aiRequests,
        aiErrorsThisMonth: ai.aiErrors,
      },
    });
  } catch (error) {
    console.error("getOverview error found", error);
    res.status(500).json({ message: "Failed to load the overview" });
  }
};

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

    const { plan, role } = req.body;

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

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    //Prevent [object] : [object] problem. Because req.user is { _id: "..." }, String(req.user) returns "[object Object]"
    const currentUserId = req.user?._id
      ? String(req.user._id)
      : String(req.user);

    if (id === String(req.user)) {
      return res
        .status(400)
        .json({
          message: "You can't destruct your own Admin account yourself",
        });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Promise.all([
      Task.deleteMany({ userId: id }),
      Note.deleteMany({user: id}),
      Subject.deleteMany({user: id}),
      Lesson.deleteMany({ userId: id }),
      Chat.deleteMany({ userId: id }),
      AiUsage.deleteMany({ userId: id }),
    ]);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ message: "Failed to delete the user" });
  }
};
