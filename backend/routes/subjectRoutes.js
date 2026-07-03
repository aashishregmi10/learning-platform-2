import express from "express";

import {
  createSubject,
  listSubjects,
  getSubject,
  getSubjectBySlug,
  updateSubject,
  deleteSubject,
  uploadSubjectThumbnail,
} from "../controllers/subjectController.js";
import { protect, adminOnly, staffOnly, attachUserIfPresent } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/list", protect, staffOnly, listSubjects);
router.get("/slug/:slug", attachUserIfPresent, getSubjectBySlug); // public — entitlement flag when logged in
router.post("/", protect, adminOnly, createSubject);
router.post("/upload-thumbnail", protect, staffOnly, upload.single("file"), uploadSubjectThumbnail);
router
  .route("/:id")
  .get(protect, staffOnly, getSubject)
  .put(protect, staffOnly, updateSubject) // teacher-scope enforced in controller
  .delete(protect, adminOnly, deleteSubject);

export default router;
