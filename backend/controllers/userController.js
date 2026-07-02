import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import TeacherProfile from "../models/TeacherProfile.js";
import { logActivity } from "../services/activityLogService.js";

/** Shared $facet paginated list helper. */
const paginate = async (Model, match, { page, limit, sort = { createdAt: -1 } }) => {
  const result = await Model.aggregate([
    { $match: match },
    {
      $facet: {
        data: [
          { $sort: sort },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: { passwordHash: 0 } },
        ],
        count: [{ $count: "total" }],
      },
    },
  ]);
  return {
    data: result[0]?.data ?? [],
    totalItems: result[0]?.count?.[0]?.total ?? 0,
  };
};

// @route POST /api/users/teachers  (admin)
export const createTeacher = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    qualification,
    specialization,
    bio,
    experience,
    assignedSubjects = [],
  } = req.body;

  if (!name || !email || !password) {
    res.status(422);
    throw new Error("name, email and password are required");
  }

  const existing = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });
  if (existing) {
    res.status(409);
    throw new Error("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    authProvider: "password",
    role: "teacher",
    isVerified: false,
  });

  const teacherProfile = await TeacherProfile.create({
    user: user._id,
    qualification,
    specialization,
    bio,
    experience,
    assignedSubjects,
    isApproved: true,
    approvedBy: req.user._id,
    approvedAt: new Date(),
  });

  await logActivity(req.user, "create_teacher", {
    targetType: "User",
    targetId: user._id,
    after: { name: user.name, email: user.email },
    req,
  });

  res.status(201).json({
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      teacherProfile,
    },
    message: "Teacher created",
  });
});

// @route GET /api/users/teachers  (admin)
export const listTeachers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const match = {
    role: "teacher",
    isDeleted: false,
    ...(search && { name: { $regex: new RegExp(search, "i") } }),
  };

  const { data, totalItems } = await paginate(User, match, { page, limit });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/users  (admin)
export const listUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const { role } = req.query;

  const match = {
    isDeleted: false,
    ...(role && { role }),
    ...(search && { name: { $regex: new RegExp(search, "i") } }),
  };

  const { data, totalItems } = await paginate(User, match, { page, limit });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route PATCH /api/users/:id/deactivate  (admin)
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isActive = false;
  user.forceLogin = true;
  await user.save();

  await logActivity(req.user, "deactivate_user", { targetType: "User", targetId: user._id, req });

  res.status(200).json({ data: { user }, message: "User deactivated" });
});

// @route PATCH /api/users/teachers/:id/approve  (admin)
export const approveTeacher = asyncHandler(async (req, res) => {
  const profile = await TeacherProfile.findById(req.params.id);
  if (!profile) {
    res.status(404);
    throw new Error("Teacher profile not found");
  }
  profile.isApproved = true;
  profile.approvedBy = req.user._id;
  profile.approvedAt = new Date();
  await profile.save();

  await User.findByIdAndUpdate(profile.user, { isVerified: true });

  await logActivity(req.user, "approve_teacher", { targetType: "TeacherProfile", targetId: profile._id, req });

  res.status(200).json({ data: { teacherProfile: profile }, message: "Teacher approved" });
});
