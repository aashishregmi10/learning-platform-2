import express from "express";

import {
  createReview,
  getSubjectReviews,
  getTeacherReviews,
  respondToReview,
  updateReviewVisibility,
} from "../controllers/reviewController.js";
import { protect, studentOnly, staffOnly, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/subject/:id", getSubjectReviews); // public
router.get("/teacher/:id", getTeacherReviews); // public
router.post("/", protect, studentOnly, createReview);
router.patch("/:id/respond", protect, staffOnly, respondToReview);
router.patch("/:id/visibility", protect, adminOnly, updateReviewVisibility);

export default router;
