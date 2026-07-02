import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import BScYear from "../models/BScYear.js";
import Program from "../models/Program.js";
import { facetPaginate } from "../utils/paginate.js";

const toId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

const YEAR_NAMES = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

// @route POST /api/years  (admin)
export const createYear = asyncHandler(async (req, res) => {
  const { program, yearNumber, description, thumbnail, bundlePrice, isActive, launchDate } =
    req.body;

  if (!program || !yearNumber || !bundlePrice?.originalPrice || !bundlePrice?.discountedPrice) {
    res.status(422);
    throw new Error("program, yearNumber and bundlePrice are required");
  }

  const programExists = await Program.exists({ _id: program, isDeleted: false });
  if (!programExists) {
    res.status(404);
    throw new Error("Program not found");
  }

  const year = await BScYear.create({
    program,
    yearNumber,
    yearName: YEAR_NAMES[yearNumber],
    description,
    thumbnail,
    bundlePrice: { ...bundlePrice, currency: "NPR" },
    isActive,
    launchDate,
  });

  res.status(201).json({ data: year, message: "Year created" });
});

// @route GET /api/years/list?program=  (admin/teacher)
export const listYears = asyncHandler(async (req, res) => {
  const { page, limit, program } = req.query;
  const { data, totalItems } = await facetPaginate(BScYear, {
    match: { isDeleted: false, ...(program && { program: toId(program) }) },
    pipeline: [
      {
        $lookup: {
          from: "programs",
          localField: "program",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "program",
        },
      },
      { $set: { program: { $first: "$program" } } },
    ],
    sort: { yearNumber: 1 },
    page,
    limit: limit || 50,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/years/:id
export const getYear = asyncHandler(async (req, res) => {
  const year = await BScYear.findOne({ _id: req.params.id, isDeleted: false }).populate(
    "program",
    "name slug"
  );
  if (!year) {
    res.status(404);
    throw new Error("Year not found");
  }
  res.status(200).json({ data: year, message: "OK" });
});

// @route PUT /api/years/:id  (admin)
export const updateYear = asyncHandler(async (req, res) => {
  const year = await BScYear.findOne({ _id: req.params.id, isDeleted: false });
  if (!year) {
    res.status(404);
    throw new Error("Year not found");
  }
  const { description, thumbnail, bundlePrice, isActive, launchDate, yearNumber } = req.body;
  if (yearNumber) {
    year.yearNumber = yearNumber;
    year.yearName = YEAR_NAMES[yearNumber];
  }
  if (description !== undefined) year.description = description;
  if (thumbnail !== undefined) year.thumbnail = thumbnail;
  if (bundlePrice) year.bundlePrice = { ...year.bundlePrice.toObject(), ...bundlePrice, currency: "NPR" };
  if (isActive !== undefined) year.isActive = isActive;
  if (launchDate !== undefined) year.launchDate = launchDate;
  await year.save();
  res.status(200).json({ data: year, message: "Year updated" });
});

// @route DELETE /api/years/:id  (admin)
export const deleteYear = asyncHandler(async (req, res) => {
  const year = await BScYear.findById(req.params.id);
  if (!year || year.isDeleted) {
    res.status(404);
    throw new Error("Year not found");
  }
  year.isDeleted = true;
  year.deletedAt = new Date();
  await year.save();
  res.status(200).json({ data: {}, message: "Year deleted" });
});
