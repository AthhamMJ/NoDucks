import AiUsage from "../models/AiUsage.js";
import { COUNTER_FIELD, currentPeriod } from "../config/aiQuotas.js";

export const recordUsage = (userId, action, usage = {}) =>
  AiUsage.updateOne(
    { userId, period: currentPeriod() },
    {
      $inc: {
        [COUNTER_FIELD[action]]: 1,
        inputTokens: usage.inputTokens || 0,
        outputTokens: usage.outputTokens || 0,
      },
    },
    { upsert: true },
  );
