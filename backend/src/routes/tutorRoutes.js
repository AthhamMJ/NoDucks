import express from "express";
import {
  generateLesson,
  chatFollowUp,
  generateQuiz,
} from "../controllers/tutorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/generate-lesson", generateLesson);
router.post("/chat", chatFollowUp);
router.post("/generate-quiz", generateQuiz);

export default router;
