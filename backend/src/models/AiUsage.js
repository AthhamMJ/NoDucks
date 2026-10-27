import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: { type: String, required: true },
    lessons: { type: Number, default: 0 },
    chats: { type: Number, default: 0 },
    quizzes: { type: Number, default: 0 },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

aiUsageSchema.index({ userId: 1, period: 1 }, { unique: true });

export default mongoose.model("AiUsage", aiUsageSchema);
