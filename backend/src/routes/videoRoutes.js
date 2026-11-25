import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  lookupLessonVideo,
  generateLessonVideo,
  getVideoStatus,
  getLessonVideo,
} from "../controllers/videoController.js";

const router = express.Router();

router.use(protect);

router.get("/lookup", lookupLessonVideo);
router.post("/generate", generateLessonVideo);
router.get("/status", getVideoStatus);
router.get("/:jobId", getLessonVideo);

export default router;