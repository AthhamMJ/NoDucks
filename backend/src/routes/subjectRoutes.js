import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getSubjects, 
    createSubject,
    getSubjectCatalog,
} from "../controllers/subjectController.js"

const router = express.Router();

router.use(protect);  //every route below needs a valid token

router.get("/", getSubjects);
router.post("/", createSubject);
router.get("/catalog", getSubjectCatalog);

export default router;