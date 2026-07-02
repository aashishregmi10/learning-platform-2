import asyncHandler from "express-async-handler";

import Progress from "../models/Progress.js";
import Content from "../models/Content.js";
import Chapter from "../models/Chapter.js";
import { canAccessContent } from "../utils/access.js";
import { maybeIssueCertificate } from "../services/certificateService.js";

// @route PUT /api/progress  (student, gated)
export const upsertProgress = asyncHandler(async (req, res) => {
  const { content: contentId, watchTime, lastPosition, isCompleted } = req.body;
  if (!contentId) {
    res.status(422);
    throw new Error("content is required");
  }

  const content = await Content.findOne({ _id: contentId, isDeleted: false });
  if (!content) {
    res.status(404);
    throw new Error("Content not found");
  }
  const chapter = await Chapter.findById(content.chapter).select("subject isFreePreview");

  const allowed = await canAccessContent({ content, chapter, studentId: req.user._id });
  if (!allowed) {
    res.status(403);
    throw new Error("Purchase required to access this content");
  }

  const existing = await Progress.findOne({ student: req.user._id, content: contentId });
  const update = {
    student: req.user._id,
    content: contentId,
    subject: chapter.subject,
    // watchTime is monotonic
    watchTime: Math.max(existing?.watchTime || 0, Number(watchTime) || 0),
    lastPosition: Number(lastPosition) || existing?.lastPosition || 0,
  };
  const nowComplete = isCompleted || existing?.isCompleted;
  if (nowComplete) {
    update.isCompleted = true;
    update.completedAt = existing?.completedAt || new Date();
  }

  const progress = await Progress.findOneAndUpdate(
    { student: req.user._id, content: contentId },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // if this completion finishes the subject, auto-issue a certificate
  let certificate = null;
  if (update.isCompleted) {
    certificate = await maybeIssueCertificate({ studentId: req.user._id, subjectId: chapter.subject });
  }

  res.status(200).json({
    data: { progress, certificateIssued: !!certificate },
    message: "Saved",
  });
});

// @route GET /api/progress/subject/:subjectId  (student)
export const getSubjectProgress = asyncHandler(async (req, res) => {
  const rows = await Progress.find({ student: req.user._id, subject: req.params.subjectId });
  const map = {};
  rows.forEach((p) => {
    map[p.content.toString()] = { isCompleted: p.isCompleted, lastPosition: p.lastPosition, watchTime: p.watchTime };
  });
  res.status(200).json({ data: map, message: "OK" });
});
