import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import { env } from "../config/env.config.js";

const DB_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

export const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({
    data: {
      status: "ok",
      db: DB_STATES[mongoose.connection.readyState] || "unknown",
      env: env.nodeEnv,
    },
    message: "healthy",
  });
});
