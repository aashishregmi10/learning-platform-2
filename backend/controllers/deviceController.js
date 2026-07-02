import asyncHandler from "express-async-handler";

import Device from "../models/Device.js";

// @route POST /api/devices  (any authenticated user)
export const registerDevice = asyncHandler(async (req, res) => {
  const { token, deviceType } = req.body;
  if (!token) {
    res.status(422);
    throw new Error("token is required");
  }

  const device = await Device.findOneAndUpdate(
    { user: req.user._id, token },
    { deviceType, lastUsedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ data: { device }, message: "Device registered" });
});
