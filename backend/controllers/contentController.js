import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Content from "../models/Content.js";
import Chapter from "../models/Chapter.js";
import Subject from "../models/Subject.js";
import { facetPaginate } from "../utils/paginate.js";
import { assertSubjectWritable } from "../utils/teacherScope.js";
import { canAccessContent } from "../utils/access.js";
import {
  uploadBuffer,
  signedDeliveryUrl,
  signedInlineUrl,
  destroyAsset,
} from "../config/cloudinary.config.js";

const toId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

const RESOURCE_BY_TYPE = { video: "video", audio: "video", pdf: "raw", note: "raw", link: "raw" };
const COUNTER_BY_TYPE = { video: "totalVideos", pdf: "totalPdfs", note: "totalNotes" };

// @route POST /api/contents  (admin/teacher-scoped) — multipart (file optional for note/link)
export const createContent = asyncHandler(async (req, res) => {
  const { chapter, type, title, description, order, isFree, noteContent, linkUrl } = req.body;

  if (!chapter || !type || !title) {
    res.status(422);
    throw new Error("chapter, type and title are required");
  }
  const chapterDoc = await Chapter.findOne({ _id: chapter, isDeleted: false });
  if (!chapterDoc) {
    res.status(404);
    throw new Error("Chapter not found");
  }
  await assertSubjectWritable(req.user, chapterDoc.subject, res);

  const content = new Content({
    chapter,
    uploadedBy: req.user._id,
    type,
    title,
    description,
    order: order ? Number(order) : 0,
    isFree: isFree === "true" || isFree === true,
  });

  if (type === "note") {
    content.noteData = { content: noteContent || "", isDownloadable: true };
    content.status = "ready";
    content.isPublished = true;
    content.publishedAt = new Date();
  } else if (type === "link") {
    content.storage = { provider: "local", fileKey: linkUrl };
    content.status = "ready";
    content.isPublished = true;
    content.publishedAt = new Date();
  } else if (req.file) {
    // video / pdf / audio upload → Cloudinary (authenticated)
    const resourceType = RESOURCE_BY_TYPE[type] || "auto";
    const result = await uploadBuffer(req.file.buffer, { resourceType });
    content.storage = {
      provider: "cloudinary",
      fileKey: result.public_id,
      resourceType: result.resource_type,
      fileSize: result.bytes,
      fileFormat: result.format,
    };
    if (type === "video" || type === "audio") {
      content.videoData = {
        durationSeconds: result.duration,
        resolution: result.width ? `${result.width}x${result.height}` : undefined,
        watermarkEnabled: true,
      };
    }
    if (type === "pdf") {
      content.pdfData = { pageCount: result.pages, isDownloadable: false };
    }
    content.status = "ready";
    content.isPublished = true;
    content.publishedAt = new Date();
  } else {
    res.status(422);
    throw new Error("A file is required for video/pdf/audio content");
  }

  await content.save();

  // maintain cached counters
  const counter = COUNTER_BY_TYPE[type];
  if (counter) {
    await Chapter.findByIdAndUpdate(chapter, {
      $inc: { [`${type}Count`]: 1 },
    });
    await Subject.findByIdAndUpdate(chapterDoc.subject, { $inc: { [counter]: 1 } });
  }

  res.status(201).json({ data: content, message: "Content created" });
});

// @route GET /api/contents/list?chapter=&type=  (any auth)
export const listContents = asyncHandler(async (req, res) => {
  const { page, limit, chapter, type } = req.query;
  const { data, totalItems } = await facetPaginate(Content, {
    match: {
      isDeleted: false,
      ...(chapter && { chapter: toId(chapter) }),
      ...(type && { type }),
    },
    sort: { order: 1, createdAt: 1 },
    page,
    limit: limit || 100,
    // never leak note bodies / storage keys in listings
    project: { "noteData.content": 0, "storage.fileKey": 0 },
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/contents/:id/play  (student, gated) — mint signed url
export const playContent = asyncHandler(async (req, res) => {
  const content = await Content.findOne({ _id: req.params.id, isDeleted: false });
  if (!content || content.status !== "ready") {
    res.status(404);
    throw new Error("Content not available");
  }
  const chapter = await Chapter.findById(content.chapter).select("subject isFreePreview");

  const allowed = await canAccessContent({
    content,
    chapter,
    studentId: req.user?.role === "student" ? req.user._id : null,
  });
  if (!allowed && req.user?.role !== "admin" && req.user?.role !== "teacher") {
    res.status(403);
    throw new Error("Purchase required to access this content");
  }

  // note & link return inline content directly
  if (content.type === "note") {
    return res.status(200).json({ data: { note: content.noteData?.content }, message: "OK" });
  }
  if (content.type === "link") {
    return res.status(200).json({ data: { url: content.storage?.fileKey }, message: "OK" });
  }

  const resourceType = content.storage?.resourceType || "video";
  const url =
    content.type === "pdf"
      ? signedDeliveryUrl(content.storage.fileKey, { resourceType, expiresInSeconds: 300 })
      : signedInlineUrl(content.storage.fileKey, { resourceType });

  await Content.updateOne({ _id: content._id }, { $inc: { viewCount: 1 } });

  res.status(200).json({
    data: {
      url,
      type: content.type,
      watermark: content.videoData?.watermarkEnabled
        ? `${req.user?.email || ""}·${req.user?._id || ""}`
        : undefined,
      expiresIn: 300,
    },
    message: "OK",
  });
});

// @route PUT /api/contents/:id  (admin/teacher-scoped) — metadata only
export const updateContent = asyncHandler(async (req, res) => {
  const content = await Content.findOne({ _id: req.params.id, isDeleted: false }).populate({
    path: "chapter",
    select: "subject",
  });
  if (!content) {
    res.status(404);
    throw new Error("Content not found");
  }
  await assertSubjectWritable(req.user, content.chapter.subject, res);

  const fields = ["title", "description", "order", "isFree", "isPublished"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) content[f] = req.body[f];
  });
  if (req.body.noteContent !== undefined && content.type === "note") {
    content.noteData.content = req.body.noteContent;
  }
  await content.save();
  res.status(200).json({ data: content, message: "Content updated" });
});

// @route DELETE /api/contents/:id  (admin/teacher-scoped) — soft delete
export const deleteContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id).populate({
    path: "chapter",
    select: "subject",
  });
  if (!content || content.isDeleted) {
    res.status(404);
    throw new Error("Content not found");
  }
  await assertSubjectWritable(req.user, content.chapter.subject, res);

  content.isDeleted = true;
  content.deletedAt = new Date();
  await content.save();

  const counter = COUNTER_BY_TYPE[content.type];
  if (counter) {
    await Chapter.findByIdAndUpdate(content.chapter._id, { $inc: { [`${content.type}Count`]: -1 } });
    await Subject.findByIdAndUpdate(content.chapter.subject, { $inc: { [counter]: -1 } });
  }
  // best-effort remove from Cloudinary
  if (content.storage?.provider === "cloudinary" && content.storage.fileKey) {
    destroyAsset(content.storage.fileKey, content.storage.resourceType).catch(() => {});
  }
  res.status(200).json({ data: {}, message: "Content deleted" });
});
