import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getLatestUpdate } from "../controllers/featureUpdateController.js";

const router = express.Router();

router.get("/latest", protect, getLatestUpdate);

export default router;
