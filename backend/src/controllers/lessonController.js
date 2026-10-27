import mongoose from "mongoose";
import Lesson from "../models/Lesson.js";
import Chat from "../models/Chat.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

//List for the history panel
export const listLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ userId: req.user._id })
      .select("topic interest createdAt")
      .sort({ _id: -1 })
      .lean();
    res.json({ lessons });
  } catch (error) {
    next(error);
  }
};

//get the full lesson for the page
export const getLesson = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid lesson id." });
    }
    const lesson = await Lesson.findOne(
      {
        _id: req.params.id,
        userId: req.user._id,
      }
    ).lean();

    if (!lesson) return res.status(404).json({ message: "Lesson not found." });
    res.json({ lesson });
  } catch (error) {
    next(error);
  }
};

//saved conversation
export const getLessonChat = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid lesson id." });
    }
    const chat = await Chat.findOne({
      lessonId: req.params.id,
      userId: req.user._id,
    }).lean();
    res.json({ messages: chat?.messages || [] });
  } catch (err) {
    next(err);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid lesson id" });
    }
    const result = await Lesson.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    await Chat.deleteOne({ lessonId: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
