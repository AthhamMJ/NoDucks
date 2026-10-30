import AiUsage from "../models/AiUsage.js";
import { COUNTER_FIELD, currentPeriod } from "../config/aiQuotas.js";

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
