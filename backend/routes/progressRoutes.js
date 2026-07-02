import express from "express";

import { upsertProgress, getSubjectProgress } from "../controllers/progressController.js";
import { protect, studentOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/", protect, studentOnly, upsertProgress);
router.get("/subject/:subjectId", protect, studentOnly, getSubjectProgress);

export default router;
