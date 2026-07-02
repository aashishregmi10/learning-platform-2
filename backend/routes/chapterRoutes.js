import express from "express";

import {
  createChapter,
  listChapters,
  getChapter,
  updateChapter,
  deleteChapter,
} from "../controllers/chapterController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/list", protect, listChapters); // students can list published chapters via catalog; staff here
router.post("/", protect, staffOnly, createChapter);
router
  .route("/:id")
  .get(protect, staffOnly, getChapter)
  .put(protect, staffOnly, updateChapter)
  .delete(protect, staffOnly, deleteChapter);

export default router;
