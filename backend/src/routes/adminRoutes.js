import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { getOverview, getUsers, updateUser } from "../controllers/adminController.js";

const router = express.Router();

router.get("/overview", protect, adminOnly, getOverview);
router.get("/users", protect, adminOnly, getUsers)
router.patch("/users/:id", protect, adminOnly, updateUser)

export default router;