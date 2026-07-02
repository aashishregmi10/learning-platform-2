import express from "express";

import {
  createContent,
  listContents,
  playContent,
  updateContent,
  deleteContent,
} from "../controllers/contentController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/list", protect, staffOnly, listContents);
router.post("/", protect, staffOnly, upload.single("file"), createContent);
router.get("/:id/play", protect, playContent); // gated in controller
router
  .route("/:id")
  .put(protect, staffOnly, updateContent)
  .delete(protect, staffOnly, deleteContent);

export default router;
