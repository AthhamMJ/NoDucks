import express from "express";
import {
  listLessons,
  getLesson,
  getLessonChat,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", listLessons);
router.get("/:id", getLesson);
router.get("/:id/chat", getLessonChat);
router.delete("/:id", deleteLesson);

export default router;
