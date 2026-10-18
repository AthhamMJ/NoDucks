import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getNotes).post(createNote);
router.route("/:id").patch(updateNote).delete(deleteNote);

export default router;
