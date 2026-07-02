import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import LiveClass from "../models/LiveClass.js";
import Attendance from "../models/Attendance.js";
import Subject from "../models/Subject.js";
import Entitlement from "../models/Entitlement.js";
import { assertSubjectWritable, getWritableSubjectIds } from "../utils/teacherScope.js";
import { hasActiveEntitlement } from "../utils/access.js";
import { facetPaginate } from "../utils/paginate.js";
import { mintJoinToken, JOIN_TOKEN_TTL_SECONDS } from "../services/joinTokenService.js";
import { signedDeliveryUrl } from "../config/cloudinary.config.js";

const toId = (id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id);

// @route POST /api/live-classes  (teacher/admin-scoped)
export const createLiveClass = asyncHandler(async (req, res) => {
  const { subject, title, description, scheduledAt, duration, timezone, audience, meetingLink, meetingPassword } = req.body;
  if (!subject || !title || !scheduledAt || !duration) {
    res.status(422);
    throw new Error("subject, title, scheduledAt and duration are required");
  }
  const subjectDoc = await Subject.findOne({ _id: subject, isDeleted: false });
  if (!subjectDoc) {
    res.status(404);
    throw new Error("Subject not found");
  }
  await assertSubjectWritable(req.user, subject, res);

  const teacher = req.user.role === "teacher" ? req.user._id : req.body.teacher;
  if (!teacher) {
    res.status(422);
    throw new Error("teacher is required");
  }

  const liveClass = await LiveClass.create({
    subject,
    teacher,
    title,
    description,
    scheduledAt,
    duration,
    timezone,
    audience: audience || "paid",
    meetingLink,
    meetingPassword,
  });
  await Subject.findByIdAndUpdate(subject, { $inc: { totalLiveClasses: 1 } });
  res.status(201).json({ data: liveClass, message: "Scheduled" });
});

// @route GET /api/live-classes/list?subject=&status=  (staff)
export const listLiveClasses = asyncHandler(async (req, res) => {
  const { page, limit, subject, status } = req.query;
  const match = { ...(subject && { subject: toId(subject) }), ...(status && { status }) };

  if (req.user.role === "teacher") {
    const writable = await getWritableSubjectIds(req.user);
    match.subject = subject ? toId(subject) : { $in: writable.map(toId) };
  }

  const { data, totalItems } = await facetPaginate(LiveClass, {
    match,
    sort: { scheduledAt: -1 },
    page,
    limit: limit || 20,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/live-classes/upcoming  (student)
export const listUpcomingForStudent = asyncHandler(async (req, res) => {
  const entitlements = await Entitlement.find({ student: req.user._id, isActive: true, expiresAt: { $gt: new Date() } }).select("subject");
  const entitledSubjectIds = entitlements.map((e) => e.subject);

  const now = new Date();
  const classes = await LiveClass.find({
    $and: [
      { $or: [{ status: "live" }, { status: "scheduled", scheduledAt: { $gte: now } }] },
      { $or: [{ audience: "free" }, { subject: { $in: entitledSubjectIds } }] },
    ],
  })
    .populate("subject", "name slug")
    .populate("teacher", "name")
    .sort({ scheduledAt: 1 });

  res.status(200).json({ data: classes, message: "OK" });
});

// @route GET /api/live-classes/:id  (staff, scoped)
export const getLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id).populate("subject", "name").populate("teacher", "name");
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  await assertSubjectWritable(req.user, liveClass.subject._id, res);
  res.status(200).json({ data: liveClass, message: "OK" });
});

// @route PUT /api/live-classes/:id  (teacher/admin-scoped)
export const updateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  await assertSubjectWritable(req.user, liveClass.subject, res);

  ["title", "description", "scheduledAt", "duration", "timezone", "audience", "meetingLink", "meetingPassword"].forEach((f) => {
    if (req.body[f] !== undefined) liveClass[f] = req.body[f];
  });
  await liveClass.save();
  res.status(200).json({ data: liveClass, message: "Live class updated" });
});

// @route DELETE /api/live-classes/:id  (teacher/admin-scoped) — cancels, doesn't hard-delete
export const cancelLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  await assertSubjectWritable(req.user, liveClass.subject, res);
  liveClass.status = "cancelled";
  await liveClass.save();
  res.status(200).json({ data: liveClass, message: "Live class cancelled" });
});

// @route PATCH /api/live-classes/:id/start  (teacher, owns subject)
export const startLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  await assertSubjectWritable(req.user, liveClass.subject, res);
  liveClass.status = "live";
  await liveClass.save();
  res.status(200).json({ data: liveClass, message: "Live class started" });
});

// @route PATCH /api/live-classes/:id/end  (teacher, owns subject)
export const endLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  await assertSubjectWritable(req.user, liveClass.subject, res);
  liveClass.status = "ended";
  await liveClass.save();
  res.status(200).json({ data: liveClass, message: "Live class ended" });
});

// @route GET /api/live-classes/:id/join  (student, gated) — mints a per-student token
export const joinLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  if (["ended", "cancelled"].includes(liveClass.status)) {
    res.status(400);
    throw new Error("This live class is no longer joinable");
  }
  if (liveClass.audience === "paid") {
    const entitled = await hasActiveEntitlement(req.user._id, liveClass.subject);
    if (!entitled) {
      res.status(403);
      throw new Error("This live class is for enrolled students.");
    }
  }

  const token = mintJoinToken({ liveClassId: liveClass._id, studentId: req.user._id });
  const joinUrl = `${liveClass.meetingLink || ""}?t=${token}`;
  res.status(200).json({ data: { joinToken: token, joinUrl, expiresIn: JOIN_TOKEN_TTL_SECONDS }, message: "OK" });
});

// @route POST /api/live-classes/:id/attendance/heartbeat  (student)
export const attendanceHeartbeat = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  const now = new Date();
  let attendance = await Attendance.findOne({ liveClass: liveClass._id, student: req.user._id });

  if (!attendance) {
    attendance = await Attendance.create({ liveClass: liveClass._id, student: req.user._id, joinedAt: now, leftAt: now, totalDurationMinutes: 0, sessionCount: 1 });
    await LiveClass.findByIdAndUpdate(liveClass._id, { $inc: { attendeeCount: 1 } });
  } else {
    const gapMinutes = (now - attendance.leftAt) / 60000;
    if (gapMinutes > 3) attendance.sessionCount += 1; // reconnected after a gap
    attendance.totalDurationMinutes += Math.min(gapMinutes, 2); // clamp: heartbeats fire ~every minute
    attendance.leftAt = now;
    await attendance.save();
  }

  res.status(200).json({ data: attendance, message: "OK" });
});

// @route GET /api/live-classes/:id/recording  (student, gated)
export const getRecording = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass || !liveClass.recording?.isAvailable) {
    res.status(404);
    throw new Error("Recording not available");
  }
  if (liveClass.audience === "paid") {
    const entitled = await hasActiveEntitlement(req.user._id, liveClass.subject);
    if (!entitled) {
      res.status(403);
      throw new Error("This recording is for enrolled students.");
    }
  }
  const url = signedDeliveryUrl(liveClass.recording.storage.fileKey, { resourceType: "video", expiresInSeconds: 300 });
  res.status(200).json({ data: { url }, message: "OK" });
});

// @route GET /api/live-classes/:id/attendance  (teacher/admin-scoped) — roster for the Detail screen
export const listAttendance = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) {
    res.status(404);
    throw new Error("Live class not found");
  }
  await assertSubjectWritable(req.user, liveClass.subject, res);
  const attendance = await Attendance.find({ liveClass: liveClass._id }).populate("student", "name email").sort({ joinedAt: 1 });
  res.status(200).json({ data: attendance, message: "OK" });
});
