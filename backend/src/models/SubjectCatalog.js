import mongoose from "mongoose";

const subjectCatalogschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlenght: 40,
      unique: true,
    },
    defaultColor: {
      type: String,
      trim: true,
      default: "#64748B",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  },
);

export default mongoose.model("SubjectCaltalog", subjectCatalogschema);
