import express from "express";

import {
  createContent,
  listContents,
  playContent,
  updateContent,
  deleteContent,
  uploadNoteImage,
  getContent,
} from "../controllers/contentController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";
import { upload, uploadImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/list", protect, staffOnly, listContents);
router.post("/", protect, staffOnly, upload.single("file"), createContent);
// Standalone so it works while a note is still being written, before it exists.
router.post("/upload-image", protect, staffOnly, uploadImage.single("file"), uploadNoteImage);
router.get("/:id/play", protect, playContent); // gated in controller
router
  .route("/:id")
  .get(protect, staffOnly, getContent)
  .put(protect, staffOnly, updateContent)
  .delete(protect, staffOnly, deleteContent);

export default router;
