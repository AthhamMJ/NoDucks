import express, { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { getOverview } from "../controllers/admin/overviewController.js";
import { getUsers, updateUser } from "../controllers/admin/userController.js";
import {
  getAdminSettings,
  updateAdminQuotas,
  updateAdminGeneral,
  getAdminList,
} from "../controllers/admin/settingsController.js";

const router = express.Router();

router.get("/overview", protect, adminOnly, getOverview);
router.get("/users", protect, adminOnly, getUsers);
router.patch("/users/:id", protect, adminOnly, updateUser);
router.get("/settings", protect, adminOnly, getAdminSettings);
router.patch("/settings/quotas", protect, adminOnly, updateAdminQuotas);
router.patch("/settings/general", protect, adminOnly, updateAdminGeneral);
router.get("/settings/admins", protect, adminOnly, getAdminList);

export default router;
