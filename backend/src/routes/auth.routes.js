import { Router } from "express";

import { requireAuth } from "../middleware/requireAuth.js";

import {
  getMe,
  signUp,
  signIn,
  signOut,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", requireAuth, signOut);
router.get("/me", requireAuth, getMe);

export default router;
