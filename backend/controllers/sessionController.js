import asyncHandler from "express-async-handler";

import ActiveSession from "../models/ActiveSession.js";
import StudentProfile from "../models/StudentProfile.js";

// @route POST /api/sessions/heartbeat  (student) — device presence + concurrency cap
export const sessionHeartbeat = asyncHandler(async (req, res) => {
  const { deviceId, deviceType } = req.body;
  if (!deviceId) {
    res.status(422);
    throw new Error("deviceId is required");
  }
  const now = new Date();

  const existing = await ActiveSession.findOne({ student: req.user._id, deviceId });
  if (existing) {
    existing.lastSeenAt = now;
    existing.deviceType = deviceType || existing.deviceType;
    existing.ip = req.ip;
    existing.userAgent = req.headers["user-agent"];
    await existing.save();
    const activeDevices = await ActiveSession.countDocuments({ student: req.user._id });
    return res.status(200).json({ data: { activeDevices, max: await maxDevices(req.user._id) }, message: "OK" });
  }

  const max = await maxDevices(req.user._id);
  const currentCount = await ActiveSession.countDocuments({ student: req.user._id });

  if (currentCount >= max) {
    const devices = await ActiveSession.find({ student: req.user._id }).sort({ lastSeenAt: 1 });
    return res.status(409).json({ data: { devices, max }, message: "Device limit reached — sign out another device to continue." });
  }

  await ActiveSession.create({
    student: req.user._id,
    deviceId,
    deviceType,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    lastSeenAt: now,
  });
  res.status(200).json({ data: { activeDevices: currentCount + 1, max }, message: "OK" });
});

const maxDevices = async (studentId) => {
  const profile = await StudentProfile.findOne({ user: studentId }).select("maxConcurrentDevices");
  return profile?.maxConcurrentDevices ?? 2;
};

// @route GET /api/sessions/mine  (student)
export const listMySessions = asyncHandler(async (req, res) => {
  const sessions = await ActiveSession.find({ student: req.user._id }).sort({ lastSeenAt: -1 });
  res.status(200).json({ data: sessions, message: "OK" });
});

// @route DELETE /api/sessions/:deviceId  (student) — kick a device (self or another)
export const deleteSession = asyncHandler(async (req, res) => {
  await ActiveSession.deleteOne({ student: req.user._id, deviceId: req.params.deviceId });
  res.status(200).json({ data: {}, message: "Device signed out" });
});
