import User from "../../models/User.js";
import Task from "../../models/Task.js";
import AiUsage from "../../models/admin/AiUsage.js";
import { currentPeriod } from "../../config/aiQuotas.js";

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

    const ai = aiTotals[0] || { aiUsers: 0, aiRequests: 0, aiErrors: 0 };

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
