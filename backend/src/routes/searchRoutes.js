import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchVideosHandler } from "../controllers/searchController.js";

const router = express.Router();

router.get("/videos", protect, searchVideosHandler);

export default router;
