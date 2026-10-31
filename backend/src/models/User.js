import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role:{
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    plan: {
      type: String,
      enum: ["free", "student"],
      default: "free",
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
      language: { type: String, default: "en-US" },
    },
  },
  {
    timestamps: true,
  },
);

// Hash the password automatically before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", userSchema);
