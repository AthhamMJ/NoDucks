import mongoose from "mongoose";
import Task from "../models/Task.js";
import { checkSubject, handleError } from "../utils/controllerHelpers.js" 

const PRIORITIES = ["low", "medium", "high"];

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    handleError(res, error, "Could not load tasks");
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, subject } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (priority && !PRIORITIES.includes(priority)) {
      return res
        .status(400)
        .json({ message: "Priority must be low, medium, or high" });
    }
    if (!(await checkSubject(subject, req.user))) {
      return res.status(400).json({ message: "Subject not found" });
    }

    const task = await Task.create({
      user: req.user,
      title,
      description,
      dueDate: dueDate || null,
      priority,
      subject: subject || null,
    });

    res.status(201).json({ task });
  } catch (error) {
    handleError(res, error, "Could not create task");
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    // only the following fields can be changed from the outside

    const allowed = [
      "title",
      "description",
      "dueDate",
      "priority",
      "isCompleted",
      "subject",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if ("title" in updates && !String(updates.title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (updates.priority && !PRIORITIES.includes(updates.priority)) {
      return res
        .status(400)
        .json({ message: "Priority must be low, medium or high" });
    }
    if ("dueDate" in updates && !updates.dueDate) updates.dueDate = null;
    if ("subject" in updates) {
      if (!(await checkSubject(updates.subject, req.user))) {
        return res.status(400).json({ message: "Subject not found" });
      }
      updates.subject = updates.subject || null;
    }
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user },
      updates,
      { new: true, runValidators: true },
    );

    if (!task) return res.status(404).json({ message: "Tasks not found" });
    res.json({ task });
  } catch (error) {
    handleError(res, error, "Could not update task");
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Task id" });
    }

    const task = await Task.findOneAndDelete({ _id: id, user: req.user });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (error) {
    handleError(res, error, "Could not delete task");
  }
};
