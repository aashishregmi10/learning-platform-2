import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import ActivityLog from "../models/ActivityLog.js";
import { facetPaginate } from "../utils/paginate.js";

const toId = (id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id);

// @route GET /api/activity-logs?actor=&action=&targetType=  (admin)
export const listActivityLogs = asyncHandler(async (req, res) => {
  const { page, limit, actor, action, targetType } = req.query;
  const match = {
    ...(actor && { actor: toId(actor) }),
    ...(action && { action }),
    ...(targetType && { targetType }),
  };

  const { data, totalItems } = await facetPaginate(ActivityLog, {
    match,
    pipeline: [
      { $lookup: { from: "users", localField: "actor", foreignField: "_id", as: "actor" } },
      { $unwind: "$actor" },
    ],
    project: { action: 1, actorRole: 1, description: 1, targetType: 1, targetId: 1, changes: 1, createdAt: 1, "actor.name": 1, "actor.email": 1 },
    page,
    limit: limit || 20,
  });

  res.status(200).json({ data, totalItems, message: "OK" });
});
