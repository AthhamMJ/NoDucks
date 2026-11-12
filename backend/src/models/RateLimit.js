import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  windowStart: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RateLimit", rateLimitSchema);
