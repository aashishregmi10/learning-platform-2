import express from "express";

import {
  createSubject,
  listSubjects,
  getSubject,
  getSubjectBySlug,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect, adminOnly, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/list", protect, staffOnly, listSubjects);
router.get("/slug/:slug", protect, getSubjectBySlug); // student/staff
router.post("/", protect, adminOnly, createSubject);
router
  .route("/:id")
  .get(protect, staffOnly, getSubject)
  .put(protect, staffOnly, updateSubject) // teacher-scope enforced in controller
  .delete(protect, adminOnly, deleteSubject);

export default router;
