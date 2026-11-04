import express from "express";
import { register, login, getMe, updateMe, deleteMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { verifyEmail, resendVerification } from "../controllers/verificationController.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router
    .route("/me")
    .get(protect, getMe)
    .patch(protect,updateMe)
    .delete(protect, deleteMe)
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

export default router;
