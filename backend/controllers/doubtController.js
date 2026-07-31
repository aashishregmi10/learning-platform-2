import asyncHandler from "express-async-handler";

import Doubt from "../models/Doubt.js";
import Chapter from "../models/Chapter.js";
import LiveClass from "../models/LiveClass.js";
import Subject from "../models/Subject.js";
import { assertSubjectWritable, getWritableSubjectIds } from "../utils/teacherScope.js";
import { canAccessChapter, canAccessLiveClass } from "../utils/access.js";
import { logActivity } from "../services/activityLogService.js";

const requireStudentOrTeacher = (req, res) => {
  if (!["student", "teacher"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Only students and teachers can use doubts");
  }
};

// @route POST /api/doubts  (student/teacher, gated like content access)
export const createDoubt = asyncHandler(async (req, res) => {
  requireStudentOrTeacher(req, res);
  const { chapter: chapterId, liveClass: liveClassId, content, parentDoubt: parentId } = req.body;
  if (!content || (!chapterId && !liveClassId)) {
    res.status(422);
    throw new Error("content and either chapter or liveClass are required");
  }

  let subject;
  if (chapterId) {
    const chapter = await Chapter.findById(chapterId).select("subject isFreePreview");
    if (!chapter) {
      res.status(404);
      throw new Error("Chapter not found");
    }
    if (req.user.role === "student") {
      const allowed = await canAccessChapter({ chapter, studentId: req.user._id });
      if (!allowed) {
        res.status(403);
        throw new Error("Purchase required to ask doubts here");
      }
    }
    subject = chapter.subject;
  } else {
    const liveClass = await LiveClass.findById(liveClassId).select("subject audience");
    if (!liveClass) {
      res.status(404);
      throw new Error("Live class not found");
    }
    if (req.user.role === "student") {
      const allowed = await canAccessLiveClass({ liveClass, studentId: req.user._id });
      if (!allowed) {
        res.status(403);
        throw new Error("Purchase required to ask doubts here");
      }
    }
    subject = liveClass.subject;
  }

  let parentDoubt = null;
  if (parentId) {
    const parent = await Doubt.findById(parentId);
    if (!parent) {
      res.status(404);
      throw new Error("Parent doubt not found");
    }
    if (parent.parentDoubt) {
      res.status(400);
      throw new Error("Replies can only be one level deep");
    }
    parentDoubt = parent._id;
  }

  const doubt = await Doubt.create({
    author: req.user._id,
    authorRole: req.user.role,
    chapter: chapterId || undefined,
    liveClass: liveClassId || undefined,
    subject,
    parentDoubt,
    content,
  });
  res.status(201).json({ data: doubt, message: "Posted" });
});

const threadedList = async (match) => {
  const top = await Doubt.find({ ...match, parentDoubt: null, isDeleted: false })
    .populate("author", "name role")
    .sort({ createdAt: -1 });
  const replies = await Doubt.find({ parentDoubt: { $in: top.map((d) => d._id) }, isDeleted: false })
    .populate("author", "name role")
    .sort({ createdAt: 1 });
  const byParent = {};
  replies.forEach((r) => {
    const key = r.parentDoubt.toString();
    (byParent[key] ||= []).push(r);
  });
  return top.map((d) => ({ ...d.toObject(), replies: byParent[d._id.toString()] || [] }));
};

// @route GET /api/doubts/chapter/:id  (student/teacher, gated)
export const listChapterDoubts = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id).select("subject isFreePreview");
  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }
  if (req.user.role === "student") {
    const allowed = await canAccessChapter({ chapter, studentId: req.user._id });
    if (!allowed) {
      res.status(403);
      throw new Error("Purchase required to view doubts here");
    }
  } else {
    await assertSubjectWritable(req.user, chapter.subject, res);
  }
  const data = await threadedList({ chapter: chapter._id });
  res.status(200).json({ data, message: "OK" });
});

// @route GET /api/doubts/live-class/:id  (student/teacher, gated)
export const listLiveClassDoubts = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id).select("subject audience");
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  if (req.user.role === "student") {
    const allowed = await canAccessLiveClass({ liveClass, studentId: req.user._id });
    if (!allowed) {
      res.status(403);
      throw new Error("Purchase required to view doubts here");
    }
  } else {
    await assertSubjectWritable(req.user, liveClass.subject, res);
  }
  const data = await threadedList({ liveClass: liveClass._id });
  res.status(200).json({ data, message: "OK" });
});

// @route GET /api/doubts/subject/:id  (teacher/admin) — the subject's Q&A tab
export const listSubjectDoubts = asyncHandler(async (req, res) => {
  await assertSubjectWritable(req.user, req.params.id, res);
  const data = await threadedList({ subject: req.params.id });
  res.status(200).json({ data, message: "OK" });
});

// @route GET /api/doubts/mine  (teacher/admin) — every subject they can answer
export const listMyDoubts = asyncHandler(async (req, res) => {
  const writableIds = await getWritableSubjectIds(req.user);
  // Admins are unrestricted, so fall back to every live subject.
  const subjectIds =
    writableIds ??
    (await Subject.find({ isDeleted: false }).distinct("_id")).map((id) => id.toString());

  const data = await threadedList({ subject: { $in: subjectIds } });
  const subjects = await Subject.find({ _id: { $in: subjectIds } }).select("name");
  const nameById = Object.fromEntries(subjects.map((s) => [s._id.toString(), s.name]));

  res.status(200).json({
    data: data.map((d) => ({ ...d, subjectName: nameById[d.subject?.toString()] })),
    unresolvedCount: data.filter((d) => !d.isResolved).length,
    message: "OK",
  });
});

// @route PATCH /api/doubts/:id/resolve  (teacher/admin)
export const resolveDoubt = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findById(req.params.id);
  if (!doubt) {
    res.status(404);
    throw new Error("Doubt not found");
  }
  await assertSubjectWritable(req.user, doubt.subject, res);
  doubt.isResolved = true;
  doubt.resolvedBy = req.user._id;
  await doubt.save();

  await logActivity(req.user, "resolve_doubt", { targetType: "Doubt", targetId: doubt._id, req });
  res.status(200).json({ data: doubt, message: "Doubt resolved" });
});

// @route POST /api/doubts/:id/upvote  (any authenticated user)
export const upvoteDoubt = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findByIdAndUpdate(req.params.id, { $inc: { upvoteCount: 1 } }, { new: true });
  if (!doubt) {
    res.status(404);
    throw new Error("Doubt not found");
  }
  res.status(200).json({ data: doubt, message: "OK" });
});
