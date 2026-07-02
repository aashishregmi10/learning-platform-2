import asyncHandler from "express-async-handler";

import Program from "../models/Program.js";
import { facetPaginate, searchMatch } from "../utils/paginate.js";
import { slugify } from "../utils/slug.js";

// @route POST /api/programs  (admin)
export const createProgram = asyncHandler(async (req, res) => {
  const { name, code, description, thumbnail, durationYears, isActive } = req.body;
  if (!name) {
    res.status(422);
    throw new Error("name is required");
  }
  const program = await Program.create({
    name,
    slug: slugify(name),
    code,
    description,
    thumbnail,
    durationYears,
    isActive,
  });
  res.status(201).json({ data: program, message: "Program created" });
});

// @route GET /api/programs/list  (admin/teacher)
export const listPrograms = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const { data, totalItems } = await facetPaginate(Program, {
    match: { isDeleted: false, ...searchMatch("name", search) },
    sort: { createdAt: -1 },
    page,
    limit,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/programs/active  (public/student)
export const listActivePrograms = asyncHandler(async (req, res) => {
  const programs = await Program.find({ isActive: true, isDeleted: false }).sort({
    name: 1,
  });
  res.status(200).json({ data: programs, message: "OK" });
});

// @route GET /api/programs/:id
export const getProgram = asyncHandler(async (req, res) => {
  const program = await Program.findOne({ _id: req.params.id, isDeleted: false });
  if (!program) {
    res.status(404);
    throw new Error("Program not found");
  }
  res.status(200).json({ data: program, message: "OK" });
});

// @route PUT /api/programs/:id  (admin)
export const updateProgram = asyncHandler(async (req, res) => {
  const program = await Program.findOne({ _id: req.params.id, isDeleted: false });
  if (!program) {
    res.status(404);
    throw new Error("Program not found");
  }
  const fields = ["name", "code", "description", "thumbnail", "durationYears", "isActive"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) program[f] = req.body[f];
  });
  if (req.body.name) program.slug = slugify(req.body.name);
  await program.save();
  res.status(200).json({ data: program, message: "Program updated" });
});

// @route DELETE /api/programs/:id  (admin) — soft delete
export const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program || program.isDeleted) {
    res.status(404);
    throw new Error("Program not found");
  }
  program.isDeleted = true;
  program.deletedAt = new Date();
  await program.save();
  res.status(200).json({ data: {}, message: "Program deleted" });
});
