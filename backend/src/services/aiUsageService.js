import User from "../models/User.js";
import AiUsage from "../models/admin/AiUsage.js";
import { COUNTER_FIELD, currentPeriod } from "../config/aiQuotas.js";
import { getQuotasForPlan } from "./settingsService.js";

export const checkQuotaAvailable = async (userId, action) => {
  if (!userId) return { available: true, used: 0, limit: 999 };
  const user = await User.findById(userId).select("plan");
  const plan = user?.plan || "free";
  const quotas = await getQuotasForPlan(plan);
  const limit = quotas[action] ?? 3;
  const usage = await AiUsage.findOne({
    userId,
    period: currentPeriod(),
  });
  const used = usage?.[COUNTER_FIELD[action]] || 0;
  return { available: used < limit, used, limit };
};

export const recordUsage = (userId, action, usage = {}) => {
  const field = COUNTER_FIELD[action];
  if (!field) throw new Error(`User AI usage action : ${action}`);

  return AiUsage.updateOne(
    { userId, period: currentPeriod() },
    {
      $inc: {
        [field]: 1,
        inputTokens: usage.inputTokens || 0,
        outputTokens: usage.outputTokens || 0,
      },
    },
    { upsert: true },
  );
};
