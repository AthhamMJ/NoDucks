import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      maxlength: 40,
    },
    color: {
      type: String,
      trim: true,
      default: "#64748B",
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a hex value like #6366F1"],
    },
    // set caltalog  when the subject was added from the suggestions list
    catalog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectCatalog",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  },
);

subjectSchema.index(
  { user: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

export default mongoose.model("Subject", subjectSchema);
