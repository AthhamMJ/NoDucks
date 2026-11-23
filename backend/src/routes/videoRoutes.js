import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getLessonVideo } from "../controllers/videoController.js";

const router = express.Router();

router.use(protect);

router.get("/:jobId", getLessonVideo);

export default router;