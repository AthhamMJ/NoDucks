import mongoose from "mongoose";
import Lesson from "../models/Lesson.js";
import Chat from "../models/Chat.js";
import VisualAsset from "../models/VisualAsset.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get visuals for a specific lesson with real-time status
export const getLessonVisuals = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid lesson id." });
    }
    const lesson = await Lesson.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .select("visuals")
      .lean();

    if (!lesson) return res.status(404).json({ message: "Lesson not found." });

    const updatedVisuals = await Promise.all(
      (lesson.visuals || []).map(async (v) => {
        if (!v.assetId) return v;
        const asset = await VisualAsset.findById(v.assetId).lean();
        if (!asset) return v;
        return {
          assetId: v.assetId,
          status: asset.status,
          url: asset.cloudinary?.url || v.url || "",
          caption: asset.caption || v.caption,
          altText: asset.altText || v.altText,
        };
      })
    );

    const allReady =
      updatedVisuals.length > 0 &&
      updatedVisuals.every((v) => v.status === "ready");

    if (allReady) {
      res.set("Cache-Control", "public, max-age=86400");
    }

    res.json({ visuals: updatedVisuals });
  } catch (error) {
    next(error);
  }
};

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
