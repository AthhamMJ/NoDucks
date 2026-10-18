import mongoose from "mongoose";
import Note from "../models/Note.js";
import { checkSubject, handleError } from "../utils/controllerHelpers.js";

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req, user }).sort({ updatedAt: -1 });
    res.json({ notes });
  } catch (error) {
    handleError(res, error, "Could not load notes");
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, description, subject } = req.body ?? {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "title is required" });
    }
    if (!(await checkSubject(subject, req.user))) {
      return res.status(400).json({ message: "Subject not found" });
    }

    const note = await Note.create({
      user: req.user,
      title,
      description,
      subject: subject || null,
    });

    res.status(200).json({ message: "Note Created", note });
  } catch (error) {
    handleError(res, error, "Could not create note");
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid note id " });
    }
    const body = req.body ?? {};
    const allowed = ["title", "description", "subject"];
    const updates = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }
    if ("title" in updates && !String(updates.title).trim()) {
      return res.status(400).json({ message: "Title is Required" });
    }
    if ("subject" in updates) {
      if (!(await checkSubject(updates.subject, req.user))) {
        return res.status(400).json({ message: "Subject is not found" });
      }
      updates.subject = updates.subject || null;
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, user: req.user },
      updates,
      { new: true, runValidators: true },
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ note });
  } catch (error) {
    handleError(res, error, "Could not update Notes");
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid note ! id" });
    }

    const note = await Note.findOneAndDelete({ _id: id, user: req.user });
    if (!note) return res.status(404).json({ message: "Note not Found" });

    res.json({ message: "Note deleted" });
  } catch (error) {
    handleError(res, error, "Could not delete note");
  }
};
