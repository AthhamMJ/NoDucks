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
import {
  listUpdates,
  createUpdate,
  deleteUpdate,
} from "../controllers/admin/featureUpdateController.js";
import { getVisualStats } from "../controllers/admin/visualAdminController.js";
import {
  uploadMiddleware,
  uploadVideoAdmin,
  publishVideoAdmin,
  listAdminVideos,
} from "../controllers/admin/videoAdminController.js";

const router = express.Router();

router.get("/overview", protect, adminOnly, getOverview);
router.get("/visuals", protect, adminOnly, getVisualStats);
router.get("/videos", protect, adminOnly, listAdminVideos);
router.post("/videos", protect, adminOnly, uploadMiddleware, uploadVideoAdmin);
router.post("/videos/:id/publish", protect, adminOnly, publishVideoAdmin);
router.get("/users", protect, adminOnly, getUsers);
router.patch("/users/:id", protect, adminOnly, updateUser);
router.get("/settings", protect, adminOnly, getAdminSettings);
router.patch("/settings/quotas", protect, adminOnly, updateAdminQuotas);
router.patch("/settings/general", protect, adminOnly, updateAdminGeneral);
router.get("/settings/admins", protect, adminOnly, getAdminList);
router.get("/updates", protect, adminOnly, listUpdates);
router.post("/updates", protect, adminOnly, createUpdate);
router.delete("/updates/:id", protect, adminOnly, deleteUpdate);

export default router;
