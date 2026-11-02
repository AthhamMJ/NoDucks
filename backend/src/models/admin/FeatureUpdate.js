import mongoose from "mongoose";

const featureUpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true, maxlength: 10000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

featureUpdateSchema.index({ createdAt: -1 });

export default mongoose.model("FeatureUpdate", featureUpdateSchema);