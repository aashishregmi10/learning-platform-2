import asyncHandler from "express-async-handler";

import Notification from "../models/Notification.js";
import { facetPaginate } from "../utils/paginate.js";

// @route GET /api/notifications/mine  (any authenticated user)
export const listMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { data, totalItems } = await facetPaginate(Notification, {
    match: { user: req.user._id },
    sort: { createdAt: -1 },
    page,
    limit: limit || 20,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route PATCH /api/notifications/:id/read  (any authenticated user)
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  res.status(200).json({ data: notification, message: "OK" });
});
