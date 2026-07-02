import asyncHandler from "express-async-handler";

import User from "../models/User.js";
import Program from "../models/Program.js";
import Subject from "../models/Subject.js";
import Content from "../models/Content.js";
import Order from "../models/Order.js";
import Subscription from "../models/Subscription.js";
import LiveClass from "../models/LiveClass.js";
import Attendance from "../models/Attendance.js";
import { facetPaginate } from "../utils/paginate.js";

// @route GET /api/admin/dashboard  (admin) — satisfies the monitoring requirement
export const getDashboard = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [students, teachers, active7d, programs, subjects, publishedContents, revenueAgg, ordersPaid, activeSubscriptions, upcoming, attendanceAgg] =
    await Promise.all([
      User.countDocuments({ role: "student", isDeleted: false }),
      User.countDocuments({ role: "teacher", isDeleted: false }),
      User.countDocuments({ isDeleted: false, lastLoginAt: { $gte: sevenDaysAgo } }),
      Program.countDocuments({ isDeleted: false }),
      Subject.countDocuments({ isDeleted: false }),
      Content.countDocuments({ isPublished: true, isDeleted: false }),
      Order.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.countDocuments({ status: "paid" }),
      Subscription.countDocuments({ status: "active" }),
      LiveClass.countDocuments({ status: { $in: ["scheduled", "live"] }, scheduledAt: { $gte: new Date() } }),
      Attendance.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, avg: { $avg: "$totalDurationMinutes" } } },
      ]),
    ]);

  res.status(200).json({
    data: {
      users: { students, teachers, active7d },
      catalog: { programs, subjects, publishedContents },
      commerce: { revenueNPR: revenueAgg[0]?.total ?? 0, ordersPaid, activeSubscriptions },
      live: { upcoming, last30dAttendanceAvg: Math.round(attendanceAgg[0]?.avg ?? 0) },
    },
    message: "OK",
  });
});

// @route GET /api/admin/monitor/:resource  (admin) — drill-down: users·subjects·live·content
export const getMonitor = asyncHandler(async (req, res) => {
  const { resource } = req.params;
  const { page, limit, search, type } = req.query;

  if (resource === "users") {
    const { data, totalItems } = await facetPaginate(User, {
      match: { isDeleted: false, ...(search && { name: { $regex: new RegExp(search, "i") } }) },
      project: { passwordHash: 0 },
      page,
      limit,
    });
    return res.status(200).json({ data, totalItems, message: "OK" });
  }

  if (resource === "subjects") {
    const { data, totalItems } = await facetPaginate(Subject, {
      match: { isDeleted: false, ...(search && { name: { $regex: new RegExp(search, "i") } }) },
      page,
      limit,
    });
    return res.status(200).json({ data, totalItems, message: "OK" });
  }

  if (resource === "live") {
    const { data, totalItems } = await facetPaginate(LiveClass, {
      match: {},
      sort: { scheduledAt: -1 },
      page,
      limit,
    });
    return res.status(200).json({ data, totalItems, message: "OK" });
  }

  if (resource === "content") {
    const { data, totalItems } = await facetPaginate(Content, {
      match: { isDeleted: false, ...(type && { type }) },
      page,
      limit,
    });
    return res.status(200).json({ data, totalItems, message: "OK" });
  }

  res.status(400);
  throw new Error("Unknown monitor resource — use users, subjects, live or content");
});
