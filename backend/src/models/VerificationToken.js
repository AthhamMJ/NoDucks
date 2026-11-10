import mongoose from "mongoose";

const verificationTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Hash of either the 6-digit OTP or the secure link token
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    // Purpose: "email_verification" or "password_reset"
    type: {
      type: String,
      enum: ["email_verification", "password_reset"],
      default: "email_verification",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// MongoDB removes the expired tokens automatically
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("VerificationToken", verificationTokenSchema);
