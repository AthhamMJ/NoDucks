import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  getSubjects,
  getSubjectCatalog,
  createSubject,
} from "../controllers/subject.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getSubjects);
router.get("/catalog", getSubjectCatalog);
router.post("/", createSubject);

export default router;
