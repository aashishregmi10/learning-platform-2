import express from "express";

import { getMyCatalog, getSubjectContent } from "../controllers/catalogController.js";
import { protect, studentOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, studentOnly, getMyCatalog);
router.get("/subject/:id", protect, getSubjectContent); // student or staff preview

export default router;
