import User from "../models/User.js";
import AiUsage from "../models/AiUsage.js";
import {
  PLAN_QUOTAS,
  COUNTER_FIELD,
  currentPeriod,
} from "../config/aiQuotas.js";

//Get this month's used and limit counts for each action
export const getUsage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("plan").lean();
    const plan = user?.plan || "free";
    const period = currentPeriod();
    const usage = await AiUsage.findOne({
      userId: req.user._id,
      period,
    }).lean();

    const quotas = PLAN_QUOTAS[plan];

    const meter = (action) => ({
      used: usage?.[COUNTER_FIELD[action]] || 0,
      limit: quotas[action],
    });

    res.json({
      plan,
      period,
      lessons: meter("lesson"),
      chats: meter("chat"),
      quizzes: meter("quiz"),
    });
  } catch (err) {
    next(err);
  }
};
