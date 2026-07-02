import asyncHandler from "express-async-handler";

import TeacherPayout from "../models/TeacherPayout.js";
import TeacherProfile from "../models/TeacherProfile.js";
import Subscription from "../models/Subscription.js";
import { facetPaginate } from "../utils/paginate.js";
import { logActivity } from "../services/activityLogService.js";

// @route POST /api/payouts/compute  (admin) — attributed revenue per teacher per period.
// Revenue-share is opt-in: only teachers with assignedSubjects and matching paid
// Subscriptions in the window get a payout row; otherwise the collection stays empty.
export const computePayouts = asyncHandler(async (req, res) => {
  const { periodStart, periodEnd, revenueSharePercent } = req.body;
  if (!periodStart || !periodEnd || !revenueSharePercent) {
    res.status(422);
    throw new Error("periodStart, periodEnd and revenueSharePercent are required");
  }

  const teachers = await TeacherProfile.find({ assignedSubjects: { $exists: true, $ne: [] } });
  const results = [];

  for (const profile of teachers) {
    const subs = await Subscription.find({
      subject: { $in: profile.assignedSubjects },
      status: { $in: ["active", "expired"] },
      createdAt: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
    });
    if (subs.length === 0) continue;

    const attributedRevenue = subs.reduce((sum, s) => sum + (s.price?.amount || 0), 0);
    const payoutAmount = Math.round(attributedRevenue * (revenueSharePercent / 100));

    const payout = await TeacherPayout.findOneAndUpdate(
      { teacher: profile.user, periodStart, periodEnd },
      { attributedSubscriptions: subs.length, attributedRevenue, revenueSharePercent, payoutAmount, currency: "NPR" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push(payout);
  }

  res.status(200).json({ data: results, message: `Computed ${results.length} payout(s)` });
});

// @route GET /api/payouts/list?teacher=&status=  (admin)
export const listPayouts = asyncHandler(async (req, res) => {
  const { page, limit, teacher, status } = req.query;
  const { data, totalItems } = await facetPaginate(TeacherPayout, {
    match: { ...(teacher && { teacher }), ...(status && { status }) },
    pipeline: [
      { $lookup: { from: "users", localField: "teacher", foreignField: "_id", as: "teacher" } },
      { $unwind: "$teacher" },
    ],
    sort: { periodStart: -1 },
    page,
    limit: limit || 20,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/payouts/:id  (admin)
export const getPayout = asyncHandler(async (req, res) => {
  const payout = await TeacherPayout.findById(req.params.id).populate("teacher", "name email").populate("processedBy", "name");
  if (!payout) {
    res.status(404);
    throw new Error("Payout not found");
  }
  res.status(200).json({ data: payout, message: "OK" });
});

// @route PATCH /api/payouts/:id  (admin) — update status/notes
export const updatePayout = asyncHandler(async (req, res) => {
  const payout = await TeacherPayout.findById(req.params.id);
  if (!payout) {
    res.status(404);
    throw new Error("Payout not found");
  }
  const before = { status: payout.status };

  if (req.body.status !== undefined) payout.status = req.body.status;
  if (req.body.notes !== undefined) payout.notes = req.body.notes;
  if (payout.status === "paid" && !payout.paidAt) {
    payout.paidAt = new Date();
    payout.processedBy = req.user._id;
  }
  await payout.save();

  await logActivity(req.user, "process_payout", {
    targetType: "TeacherPayout",
    targetId: payout._id,
    before,
    after: { status: payout.status },
    req,
  });

  res.status(200).json({ data: payout, message: "Payout updated" });
});
