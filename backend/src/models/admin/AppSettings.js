import mongoose from "mongoose";
import { PLAN_QUOTAS } from "../../config/aiQuotas.js";

const quotaField = (defaultValue) => ({
  type: Number,
  default: defaultValue,
  min: 0,
});

const appSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    quotas: {
      free: {
        lesson: quotaField(PLAN_QUOTAS.free.lesson),
        chat: quotaField(PLAN_QUOTAS.free.chat),
        quiz: quotaField(PLAN_QUOTAS.free.quiz),
      },
      student: {
        lesson: quotaField(PLAN_QUOTAS.student.lesson),
        chat: quotaField(PLAN_QUOTAS.student.chat),
        quiz: quotaField(PLAN_QUOTAS.student.quiz),
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("AppSettings", appSettingsSchema);
