import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Subject from "../models/Subject.js";
import BScYear from "../models/BScYear.js";
import { facetPaginate, searchMatch } from "../utils/paginate.js";
import { assertSubjectWritable, getWritableSubjectIds } from "../utils/teacherScope.js";
import { hasActiveEntitlement } from "../utils/access.js";
import { slugify } from "../utils/slug.js";
import { logActivity } from "../services/activityLogService.js";
import { uploadPublicImage } from "../config/cloudinary.config.js";

const toId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

// @route POST /api/subjects  (admin only — creating new subjects is admin work)
export const createSubject = asyncHandler(async (req, res) => {
  const { year, name, subjectCode, description, category, pricing, tags, semester, displayOrder, thumbnail } =
    req.body;

  if (!year || !name || !pricing?.originalPrice || !pricing?.discountedPrice) {
    res.status(422);
    throw new Error("year, name and pricing are required");
  }

  const yearDoc = await BScYear.findOne({ _id: year, isDeleted: false });
  if (!yearDoc) {
    res.status(404);
    throw new Error("Year not found");
  }

  const subject = await Subject.create({
    program: yearDoc.program,
    year,
    semester,
    name,
    slug: slugify(name),
    subjectCode,
    description,
    category,
    displayOrder,
    pricing: { ...pricing, currency: "NPR" },
    tags,
    thumbnail,
  });

  await BScYear.findByIdAndUpdate(year, { $inc: { totalSubjects: 1 } });

  await logActivity(req.user, "create_subject", { targetType: "Subject", targetId: subject._id, after: subject.toObject(), req });

  res.status(201).json({ data: subject, message: "Subject created" });
});

// @route POST /api/subjects/upload-thumbnail  (admin/teacher)
// Standalone (not /:id/thumbnail) so it works during subject creation,
// before an id exists — the returned URL is just carried in form state.
export const uploadSubjectThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(422);
    throw new Error("No file uploaded");
  }
  const result = await uploadPublicImage(req.file.buffer);
  res.status(200).json({ data: { url: result.secure_url }, message: "Uploaded" });
});

// @route GET /api/subjects/list?program=&year=&search=  (admin/teacher)
export const listSubjects = asyncHandler(async (req, res) => {
  const { page, limit, program, year, search } = req.query;

  const writableIds = await getWritableSubjectIds(req.user);
  const teacherScope = writableIds ? { _id: { $in: writableIds.map(toId) } } : {};

  const { data, totalItems } = await facetPaginate(Subject, {
    match: {
      isDeleted: false,
      ...teacherScope,
      ...(program && { program: toId(program) }),
      ...(year && { year: toId(year) }),
      ...searchMatch("name", search),
    },
    // Populate year so every screen listing/picking subjects (admin list,
    // teacher assignment, teacher's own subjects, live-class picker) can
    // disambiguate same-named subjects across academic years.
    pipeline: [
      {
        $lookup: {
          from: "bscyears",
          localField: "year",
          foreignField: "_id",
          as: "year",
          pipeline: [{ $project: { yearNumber: 1, yearName: 1 } }],
        },
      },
      { $unwind: { path: "$year", preserveNullAndEmptyArrays: true } },
    ],
    sort: { displayOrder: 1, createdAt: -1 },
    page,
    limit,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/subjects/:id
export const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, isDeleted: false })
    .populate("program", "name slug")
    .populate("year", "yearNumber yearName");
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.status(200).json({ data: subject, message: "OK" });
});

// @route GET /api/subjects/slug/:slug  (student/public — with entitlement flag)
export const getSubjectBySlug = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ slug: req.params.slug, isActive: true, isDeleted: false })
    .populate("program", "name slug")
    .populate("year", "yearNumber yearName");
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }
  let entitled = false;
  if (req.user?.role === "student") {
    entitled = await hasActiveEntitlement(req.user._id, subject._id);
  }
  res.status(200).json({ data: { ...subject.toObject(), entitled }, message: "OK" });
});

// @route PUT /api/subjects/:id  (admin/teacher-scoped)
export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, isDeleted: false });
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }
  await assertSubjectWritable(req.user, subject._id, res);

  const before = subject.toObject();
  const fields = ["name", "subjectCode", "description", "category", "displayOrder", "semester", "tags", "thumbnail", "isActive", "metaTitle", "metaDescription"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) subject[f] = req.body[f];
  });
  if (req.body.name) subject.slug = slugify(req.body.name);
  if (req.body.pricing) subject.pricing = { ...subject.pricing.toObject(), ...req.body.pricing, currency: "NPR" };
  await subject.save();

  await logActivity(req.user, req.body.pricing ? "update_pricing" : "update_subject", {
    targetType: "Subject",
    targetId: subject._id,
    before,
    after: subject.toObject(),
    req,
  });

  res.status(200).json({ data: subject, message: "Subject updated" });
});

// @route DELETE /api/subjects/:id  (admin)
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject || subject.isDeleted) {
    res.status(404);
    throw new Error("Subject not found");
  }
  subject.isDeleted = true;
  subject.deletedAt = new Date();
  await subject.save();
  await BScYear.findByIdAndUpdate(subject.year, { $inc: { totalSubjects: -1 } });
  res.status(200).json({ data: {}, message: "Subject deleted" });
});
