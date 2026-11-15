import express from "express";
import {
  listLessons,
  getLesson,
  getLessonVisuals,
  getLessonChat,
  deleteLesson,
} from "../controllers/lessonController.js";
import { generateLesson } from "../controllers/tutor/tutorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimit } from "../middleware/aiLimit.js";

const router = express.Router();

router.use(protect);

router.get("/", listLessons);
router.post("/", aiLimit("lesson"), generateLesson);
router.get("/:id", getLesson);
router.get("/:id/visuals", getLessonVisuals);
router.get("/:id/chat", getLessonChat);
router.delete("/:id", deleteLesson);

export default router;
