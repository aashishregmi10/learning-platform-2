import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import StudentProfile from "../models/StudentProfile.js";
import Program from "../models/Program.js";
import BScYear from "../models/BScYear.js";
import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Content from "../models/Content.js";
import Quiz from "../models/Quiz.js";
import { canAccessContent, canAccessChapter, hasActiveEntitlement } from "../utils/access.js";

// @route GET /api/catalog/me  (student) — their program's years + subjects
export const getMyCatalog = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile?.program) {
    return res.status(200).json({
      data: { program: null, years: [] },
      message: "No program selected yet",
    });
  }

  const program = await Program.findOne({ _id: profile.program, isActive: true, isDeleted: false });
  if (!program) {
    return res.status(200).json({ data: { program: null, years: [] }, message: "OK" });
  }

  const years = await BScYear.find({ program: program._id, isActive: true, isDeleted: false }).sort({
    yearNumber: 1,
  });

  const Entitlement = mongoose.models.Entitlement;

  const yearsWithSubjects = await Promise.all(
    years.map(async (year) => {
      const subjects = await Subject.find({
        year: year._id,
        isActive: true,
        isDeleted: false,
      }).sort({ displayOrder: 1 });

      const withEntitlement = await Promise.all(
        subjects.map(async (s) => {
          let entitled = false;
          if (Entitlement) {
            entitled = !!(await Entitlement.exists({
              student: req.user._id,
              subject: s._id,
              isActive: true,
              expiresAt: { $gt: new Date() },
            }));
          }
          return {
            _id: s._id,
            name: s.name,
            slug: s.slug,
            thumbnail: s.thumbnail,
            category: s.category,
            pricing: s.pricing,
            totalChapters: s.totalChapters,
            ratingAverage: s.ratingAverage,
            entitled,
          };
        })
      );

      return {
        _id: year._id,
        yearNumber: year.yearNumber,
        yearName: year.yearName,
        bundlePrice: year.bundlePrice,
        subjects: withEntitlement,
      };
    })
  );

  res.status(200).json({
    data: { program: { _id: program._id, name: program.name, slug: program.slug }, years: yearsWithSubjects },
    message: "OK",
  });
});

// @route GET /api/catalog/public/:programSlug  (public) — years + subjects for anonymous browsing
export const getPublicCatalog = asyncHandler(async (req, res) => {
  const program = await Program.findOne({ slug: req.params.programSlug, isActive: true, isDeleted: false });
  if (!program) {
    res.status(404);
    throw new Error("Program not found");
  }

  const years = await BScYear.find({ program: program._id, isActive: true, isDeleted: false }).sort({
    yearNumber: 1,
  });

  const yearsWithSubjects = await Promise.all(
    years.map(async (year) => {
      const subjects = await Subject.find({
        year: year._id,
        isActive: true,
        isDeleted: false,
      }).sort({ displayOrder: 1 });

      return {
        _id: year._id,
        yearNumber: year.yearNumber,
        yearName: year.yearName,
        bundlePrice: year.bundlePrice,
        subjects: subjects.map((s) => ({
          _id: s._id,
          name: s.name,
          slug: s.slug,
          thumbnail: s.thumbnail,
          category: s.category,
          pricing: s.pricing,
          totalChapters: s.totalChapters,
          ratingAverage: s.ratingAverage,
          ratingCount: s.ratingCount,
        })),
      };
    })
  );

  res.status(200).json({
    data: { program: { _id: program._id, name: program.name, slug: program.slug, description: program.description }, years: yearsWithSubjects },
    message: "OK",
  });
});

// @route GET /api/catalog/subject/:id  (student) — chapters + content, gated
export const getSubjectContent = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, isActive: true, isDeleted: false });
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }

  const chapters = await Chapter.find({
    subject: subject._id,
    isPublished: true,
    isDeleted: false,
  }).sort({ chapterNumber: 1 });

  const studentId = req.user?.role === "student" ? req.user._id : null;

  const chapterTree = await Promise.all(
    chapters.map(async (chapter) => {
      const contents = await Content.find({
        chapter: chapter._id,
        isPublished: true,
        isDeleted: false,
      })
        .select("-noteData.content -storage.fileKey")
        .sort({ order: 1 });

      const items = await Promise.all(
        contents.map(async (c) => {
          const locked = !(await canAccessContent({ content: c, chapter, studentId }));
          return {
            _id: c._id,
            type: c.type,
            title: c.title,
            order: c.order,
            durationSeconds: c.videoData?.durationSeconds,
            locked,
          };
        })
      );

      const quizLocked = !(await canAccessChapter({ chapter, studentId }));
      const quizzes = (
        await Quiz.find({ chapter: chapter._id, isPublished: true, isDeleted: false })
          .select("title")
          .sort({ createdAt: 1 })
      ).map((q) => ({ _id: q._id, title: q.title, locked: quizLocked }));

      return {
        _id: chapter._id,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        isFreePreview: chapter.isFreePreview,
        items,
        quizzes,
      };
    })
  );

  const entitled = studentId ? await hasActiveEntitlement(studentId, subject._id) : false;

  res.status(200).json({
    data: {
      subject: {
        _id: subject._id,
        name: subject.name,
        slug: subject.slug,
        pricing: subject.pricing,
        entitled,
      },
      chapters: chapterTree,
    },
    message: "OK",
  });
});
