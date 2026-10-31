import express from "express";
import {
  generateLesson,
  chatFollowUp,
  generateQuiz,
} from "../controllers/tutorController.js";
import { getUsage } from "../controllers/usageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimit } from "../middleware/aiLimit.js";

const router = express.Router();

router.use(protect);

router.get("/usage", getUsage);
router.post("/generate-lesson", aiLimit("lesson"), generateLesson);
router.post("/chat", aiLimit("chat"), chatFollowUp);
router.post("/generate-quiz", aiLimit("quiz"), generateQuiz);

export default router;
