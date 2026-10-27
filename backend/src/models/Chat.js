import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    mode: { type: String, default: "question" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  },
);

chatSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model("Chat", chatSchema);
