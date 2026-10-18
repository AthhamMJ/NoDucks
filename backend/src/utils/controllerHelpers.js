import mongoose from "mongoose";
import Subject from "../models/Subject.js";

// A shared check and the error handler for the notes and tasks
//A subject id is only allowed if it belongs to the logged-in student
export async function checkSubject(subjectId, userId) {
  if (!subjectId) return true;
  if (!mongoose.isValidObjectId(subjectId)) return false;
  return Boolean(await Subject.exists({ _id: subjectId, user: userId }));
}

export function handleError(res, error, fallback) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  console.error(fallback, error);
  return res.status(500).json({ message: fallback });
}