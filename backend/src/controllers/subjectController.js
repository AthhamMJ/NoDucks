import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import SubjectCatalog from "../models/SubjectCatalog.js";

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#8B5CF6",
];
const CASE_INSENSITIVE = { locale: "en", strength: 2 };

const cleanName = (value = "") => String(value).replace(/\s+/g, " ").trim();

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user })
      .collation(CASE_INSENSITIVE)
      .sort({ name: 1 });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({
      message: "Could not load subjects",
      error: error.message,
    });
  }
};

export const getSubjectCatalog = async (req, res) => {
  try {
    const catalog = await SubjectCatalog.find().sort({ name: 1 });
    res.json({ catalog });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Could not load subject suggessions" });
  }
};

//we can use it to add the aunjects or get the previous subject
export const createSubject = async (req, res) => {
  try {
    const name = cleanName(req.body.name);
    if (!name) {
      return res.status(400).json({ message: "Subject Name is Required" });
    }

    let catalogEntry = null;
    if (req.body.catalogId && mongoose.isValidObjectId(req.body.catalogId)){
      catalogEntry = await SubjectCatalog.findById(req.body.catalogId);
    }

    const sameSubject = {
      user: req.user,
      $or: [{ name }, ...(catalogEntry ? [{ catalog: catalogEntry._id }] : [])],
    };

    const existing =
      await Subject.findOne(sameSubject).collation(CASE_INSENSITIVE);
    if (existing) return res.json({ subject: existing });

    const count = await Subject.countDocuments({ user: req.user });
    const subject = await Subject.create({
      user: req.user,
      name,
      color:
        req.body.color ||
        catalogEntry?.defaultColor ||
        COLORS[count % COLORS.length],
      catalog: catalogEntry?._id ?? null,
    });

    res.status(201).json({ subject });
  } catch (error) {
    if (error.code === 11000) {
      const existing = await Subject.findOne({
        user: req.user,
        name: cleanName(req.body.name),
      }).collation(CASE_INSENSITIVE);
      if (existing) return res.json({ subject: existing });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Could not add subject" });
  }
};
