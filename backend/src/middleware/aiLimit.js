import User from "../models/User.js";
import AiUsage from "../models/AiUsage.js";
import {
  PLAN_QUOTAS,
  COUNTER_FIELD,
  currentPeriod,
} from "../config/aiQuotas.js";

export const aiLimit = (action) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("plan");
    const plan = user?.plan || "free";
    const quotas = PLAN_QUOTAS[plan] || PLAN_QUOTAS.free;
    const limit = quotas[action];

    const usage = await AiUsage.findOne({
      userId: req.user._id,
      period: currentPeriod(),
    });
    const used = usage?.[COUNTER_FIELD[action]] || 0;

    if (used >= limit) {
      return res.status(429).json({
        message: `You've used all ${limit} ${action} for this month.`,
        used,
        limit,
        remaining: 0,
      });
    }

    req.aiQuota = { used, limit, remaining: limit - used };
    next();
  } catch (error) {
    next(error);
  }
};
