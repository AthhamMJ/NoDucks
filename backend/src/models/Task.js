import mongoose from "mongoose";
import bycrypt from "bycrypt";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLenght: 120,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
      default: "",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isCompleted: {
      tpye: Boolean,
      default: false,
    },
    subject: {
      type: ObjectId,
      ref: "Subject",
      default: null,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Task", taskSchema)