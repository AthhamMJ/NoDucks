import User from "../models/User.js";
import Task from "../models/Task.js";

export const getOverview = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalUsers, newUsers, totalTasks] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Task.countDocuments(),
    ]);

    res.json({
      stats: {
        totalUsers,
        newUsers7d: newUsers,
        totalTasks,
      },
    });
  } catch (error) {
    console.error("getOverview error found", error)
    res.status(500).json({ message: "Failed to load the overview" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
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
    const { plan, role } = req.body;

    const allowed = {};
    if (plan !== undefined) {
      if (!["free", "student"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      allowed.plan = plan;
    }  
    if(role !== undefined){
      if(!["user", "admin"]. includes(role)){
        return res.status(400).json({message: "Invalid role"})
      }
      if (id === String(req.user) && role !== "admin") {
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
