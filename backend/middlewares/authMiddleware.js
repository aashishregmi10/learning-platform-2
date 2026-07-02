import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import { env } from "../config/env.config.js";
import User from "../models/User.js";

/** Sign a JWT carrying only id + role (no multi-tenancy). */
export const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

/** Require a valid Bearer token; attaches req.user (minus password). */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Unauthorized — no token");
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    res.status(401);
    throw new Error("Unauthorized — token failed");
  }

  const user = await User.findById(decoded.id).select("-passwordHash");

  if (!user || user.isDeleted || !user.isActive) {
    res.status(401);
    throw new Error("Unauthorized — account unavailable");
  }

  if (user.forceLogin) {
    res.status(401);
    throw new Error("Settings changed. Please log in again.");
  }

  req.user = user;
  next();
});

/**
 * Optional auth for public-but-entitlement-aware endpoints: decodes a Bearer
 * token if one is present and valid, attaching req.user — but never 401s.
 * A missing, malformed, or expired token just proceeds as anonymous.
 */
export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();

  try {
    const decoded = jwt.verify(header.split(" ")[1], env.jwtSecret);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (user && !user.isDeleted && user.isActive && !user.forceLogin) {
      req.user = user;
    }
  } catch {
    // invalid/expired token — proceed anonymously rather than blocking
  }
  next();
});

/** Role guards — assume `protect` ran first. */
const requireRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Forbidden — insufficient role");
    }
    next();
  });

export const adminOnly = requireRole("admin");
export const teacherOnly = requireRole("teacher");
export const studentOnly = requireRole("student");
export const staffOnly = requireRole("admin", "teacher");
