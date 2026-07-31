import express from "express";

import {
  createDoubt,
  listChapterDoubts,
  listLiveClassDoubts,
  listSubjectDoubts,
  listMyDoubts,
  resolveDoubt,
  upvoteDoubt,
} from "../controllers/doubtController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, staffOnly, listMyDoubts);
router.get("/subject/:id", protect, staffOnly, listSubjectDoubts);
router.get("/chapter/:id", protect, listChapterDoubts);
router.get("/live-class/:id", protect, listLiveClassDoubts);
router.post("/", protect, createDoubt);
router.patch("/:id/resolve", protect, staffOnly, resolveDoubt);
router.post("/:id/upvote", protect, upvoteDoubt);

export default router;
