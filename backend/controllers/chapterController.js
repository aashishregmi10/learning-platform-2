import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Chapter from "../models/Chapter.js";
import Subject from "../models/Subject.js";
import { facetPaginate } from "../utils/paginate.js";
import { assertSubjectWritable } from "../utils/teacherScope.js";
import { slugify } from "../utils/slug.js";

const toId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

// @route POST /api/chapters  (admin/teacher-scoped)
export const createChapter = asyncHandler(async (req, res) => {
  const { subject, chapterNumber, title, description, learningObjectives, topics, estimatedDuration, isFreePreview } =
    req.body;

  if (!subject || chapterNumber == null || !title) {
    res.status(422);
    throw new Error("subject, chapterNumber and title are required");
  }
  const subjectDoc = await Subject.findOne({ _id: subject, isDeleted: false });
  if (!subjectDoc) {
    res.status(404);
    throw new Error("Subject not found");
  }
  await assertSubjectWritable(req.user, subject, res);

  const chapter = await Chapter.create({
    subject,
    chapterNumber,
    title,
    slug: slugify(title),
    description,
    learningObjectives,
    topics,
    estimatedDuration,
    isFreePreview: !!isFreePreview,
  });

  await Subject.findByIdAndUpdate(subject, { $inc: { totalChapters: 1 } });
  res.status(201).json({ data: chapter, message: "Chapter created" });
});

// @route GET /api/chapters/list?subject=  (any auth)
export const listChapters = asyncHandler(async (req, res) => {
  const { page, limit, subject } = req.query;
  const { data, totalItems } = await facetPaginate(Chapter, {
    match: { isDeleted: false, ...(subject && { subject: toId(subject) }) },
    sort: { chapterNumber: 1 },
    page,
    limit: limit || 100,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/chapters/:id
export const getChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findOne({ _id: req.params.id, isDeleted: false });
  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }
  res.status(200).json({ data: chapter, message: "OK" });
});

// @route PUT /api/chapters/:id  (admin/teacher-scoped)
export const updateChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findOne({ _id: req.params.id, isDeleted: false });
  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }
  await assertSubjectWritable(req.user, chapter.subject, res);

  const fields = ["chapterNumber", "title", "description", "learningObjectives", "topics", "estimatedDuration", "isFreePreview", "isPublished"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) chapter[f] = req.body[f];
  });
  if (req.body.title) chapter.slug = slugify(req.body.title);
  if (req.body.isPublished && !chapter.publishedAt) chapter.publishedAt = new Date();
  await chapter.save();
  res.status(200).json({ data: chapter, message: "Chapter updated" });
});

// @route DELETE /api/chapters/:id  (admin/teacher-scoped)
export const deleteChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findById(req.params.id);
  if (!chapter || chapter.isDeleted) {
    res.status(404);
    throw new Error("Chapter not found");
  }
  await assertSubjectWritable(req.user, chapter.subject, res);
  chapter.isDeleted = true;
  chapter.deletedAt = new Date();
  await chapter.save();
  await Subject.findByIdAndUpdate(chapter.subject, { $inc: { totalChapters: -1 } });
  res.status(200).json({ data: {}, message: "Chapter deleted" });
});
