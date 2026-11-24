import express from "express";
import { getLessonVideo } from "../controllers/videoController.js";

const router = express.Router();

router.get("/:jobId", getLessonVideo);

export default router;
