import mongoose from "mongoose";

const visualAssetSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["image", "video"],
      default: "image",
      index: true,
    },
    assetKey: {
      type: String,
      required: true,
    },
    variant: {
      type: Number,
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
    title: {
      type: String,
      default: "",
    },
    aliases: {
      type: [String],
      default: [],
    },
    learningLevel: {
      type: String,
      default: "intermediate",
    },
    storyId: {
      type: String,
      default: "",
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
    posterUrl: {
      type: String,
      default: "",
    },
    captionsUrl: {
      type: String,
      default: "",
    },
    durationSeconds: {
      type: Number,
      default: 0,
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
      enum: ["generating", "ready", "failed", "caption-only", "draft"],
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
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 1. Compound unique indexes
visualAssetSchema.index({ assetKey: 1, variant: 1 }, { unique: true });
visualAssetSchema.index({ assetKey: 1, kind: 1 });

// 2. Lookup indexes for images and videos
visualAssetSchema.index({ conceptId: 1, storyId: 1 });
visualAssetSchema.index({ conceptId: 1, kind: 1, status: 1 });
visualAssetSchema.index({ aliases: 1, kind: 1, status: 1 });

// 3. Generation lock: Unique partial index so only one worker generates a given image assetKey at a time
visualAssetSchema.index(
  { assetKey: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "generating" },
  }
);

export default mongoose.model("VisualAsset", visualAssetSchema);
