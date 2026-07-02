import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Review from "../models/Review.js";
import Entitlement from "../models/Entitlement.js";
import Chapter from "../models/Chapter.js";
import { assertSubjectWritable } from "../utils/teacherScope.js";
import { recomputeRating, ratingSummary } from "../services/reviewService.js";
import { logActivity } from "../services/activityLogService.js";
import { facetPaginate } from "../utils/paginate.js";

const toId = (id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id);

// @route POST /api/reviews  (student, entitlement-gated)
export const createReview = asyncHandler(async (req, res) => {
  const { targetType, subject, teacher, rating, comment } = req.body;
  if (!targetType || !rating) {
    res.status(422);
    throw new Error("targetType and rating are required");
  }

  if (targetType === "subject") {
    if (!subject) {
      res.status(422);
      throw new Error("subject is required");
    }
    // Past/present purchase counts — an Entitlement row for this subject ever existing is enough.
    const everEntitled = await Entitlement.exists({ student: req.user._id, subject });
    if (!everEntitled) {
      res.status(403);
      throw new Error("Only enrolled students can review.");
    }
  } else if (targetType === "teacher") {
    if (!teacher) {
      res.status(422);
      throw new Error("teacher is required");
    }
  } else {
    res.status(422);
    throw new Error("targetType must be 'subject' or 'teacher'");
  }

  const review = await Review.create({
    student: req.user._id,
    targetType,
    subject: targetType === "subject" ? subject : undefined,
    teacher: targetType === "teacher" ? teacher : undefined,
    rating,
    comment,
  });

  await recomputeRating({ targetType, subjectId: subject, teacherId: teacher });
  res.status(201).json({ data: review, message: "Review posted" });
});

// @route GET /api/reviews/subject/:id  (public/student)
export const getSubjectReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const summary = await ratingSummary({ targetType: "subject", subjectId: toId(req.params.id) });
  const { data, totalItems } = await facetPaginate(Review, {
    match: { targetType: "subject", subject: toId(req.params.id), isVisible: true },
    pipeline: [{ $lookup: { from: "users", localField: "student", foreignField: "_id", as: "student" } }, { $unwind: "$student" }],
    project: { rating: 1, comment: 1, response: 1, createdAt: 1, "student.name": 1 },
    page,
    limit: limit || 10,
  });
  res.status(200).json({ data: { summary, reviews: data }, totalItems, message: "OK" });
});

// @route GET /api/reviews/teacher/:id  (public/student)
export const getTeacherReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const summary = await ratingSummary({ targetType: "teacher", teacherId: toId(req.params.id) });
  const { data, totalItems } = await facetPaginate(Review, {
    match: { targetType: "teacher", teacher: toId(req.params.id), isVisible: true },
    pipeline: [{ $lookup: { from: "users", localField: "student", foreignField: "_id", as: "student" } }, { $unwind: "$student" }],
    project: { rating: 1, comment: 1, response: 1, createdAt: 1, "student.name": 1 },
    page,
    limit: limit || 10,
  });
  res.status(200).json({ data: { summary, reviews: data }, totalItems, message: "OK" });
});

// @route PATCH /api/reviews/:id/respond  (teacher/admin)
export const respondToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.targetType === "subject") {
    await assertSubjectWritable(req.user, review.subject, res);
  } else if (req.user.role === "teacher" && String(review.teacher) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only respond to your own reviews");
  }

  review.response = { text: req.body.text, respondedAt: new Date(), respondedBy: req.user._id };
  await review.save();
  res.status(200).json({ data: review, message: "Response posted" });
});

// @route PATCH /api/reviews/:id/visibility  (admin)
export const updateReviewVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  const before = review.isVisible;
  review.isVisible = !!req.body.isVisible;
  await review.save();
  await recomputeRating({ targetType: review.targetType, subjectId: review.subject, teacherId: review.teacher });

  await logActivity(req.user, "hide_review", {
    targetType: "Review",
    targetId: review._id,
    before: { isVisible: before },
    after: { isVisible: review.isVisible },
    req,
  });

  res.status(200).json({ data: review, message: "Review visibility updated" });
});
