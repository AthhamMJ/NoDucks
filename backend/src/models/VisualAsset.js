import mongoose from "mongoose";

const visualAssetSchema = new mongoose.Schema(
  {
    assetKey: {
      type: String,
      required: true,
      index: true,
    },
    variant: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    conceptId: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      default: "general",
    },
    topic: {
      type: String,
      required: true,
    },
    learningLevel: {
      type: String,
      default: "intermediate",
    },
    storyId: {
      type: String,
      required: true,
    },
    storyTitle: {
      type: String,
      default: "",
    },
    visualContext: {
      type: String,
      default: "",
    },
    interestTags: {
      type: [String],
      default: [],
    },
    visualStyle: {
      type: String,
      default: "comic-clean-v1",
    },
    promptVersion: {
      type: String,
      default: "v1",
    },
    provider: {
      type: String,
      default: "gemini",
    },
    cloudinary: {
      publicId: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    caption: {
      type: String,
      default: "",
    },
    altText: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["generating", "ready", "failed", "caption-only"],
      default: "generating",
      index: true,
    },
    error: {
      code: { type: String, default: "" },
      message: { type: String, default: "" },
      retries: { type: Number, default: 0 },
    },
    reuseCount: {
      type: Number,
      default: 0,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 1. Unique compound index on assetKey + variant
visualAssetSchema.index({ assetKey: 1, variant: 1 }, { unique: true });

// 2. Index on conceptId + storyId for fast candidate lookup
visualAssetSchema.index({ conceptId: 1, storyId: 1 });

// 3. Generation lock: Unique partial index so only one worker generates a given assetKey at a time
visualAssetSchema.index(
  { assetKey: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "generating" },
  }
);

export default mongoose.model("VisualAsset", visualAssetSchema);

