import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import { env } from "../config/env.config.js";
import { signToken } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import TeacherProfile from "../models/TeacherProfile.js";

const googleClient = new OAuth2Client(env.googleClientId);

/** Shape the user object returned to the client (with a fresh token). */
const toAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
  token: signToken(user),
});

/** Load the role-specific profile for a user. */
const loadProfile = async (user) => {
  if (user.role === "teacher")
    return TeacherProfile.findOne({ user: user._id });
  if (user.role === "student")
    return StudentProfile.findOne({ user: user._id });
  return null;
};

// @route POST /api/auth/google  (students only)
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error("idToken is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    if (user.role !== "student") {
      res.status(403);
      throw new Error("Please use staff login for this account.");
    }
    // backfill googleId on first Google sign-in
    if (!user.googleId) user.googleId = googleId;
  } else {
    user = new User({
      googleId,
      email,
      name,
      avatar: picture,
      authProvider: "google",
      role: "student",
      isVerified: true,
    });
    await user.save();
    await StudentProfile.create({ user: user._id });
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.status(200).json({ data: { user: toAuthUser(user) }, message: "Logged in" });
});

// @route POST /api/auth/login  (admin + teacher)
export const staffLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash"
  );

  if (
    !user ||
    user.role === "student" ||
    user.authProvider !== "password" ||
    !user.passwordHash
  ) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  user.forceLogin = false;
  user.lastLoginAt = new Date();
  await user.save();

  res.status(200).json({ data: { user: toAuthUser(user) }, message: "Logged in" });
});

// @route POST /api/auth/dev-login  (NON-PRODUCTION ONLY)
// Issues a token for a seed user by email so the student UI (Google-only)
// can be exercised in development without a real Google account.
export const devLogin = asyncHandler(async (req, res) => {
  if (env.nodeEnv === "production") {
    res.status(403);
    throw new Error("Disabled in production");
  }
  const { email } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error("User not found — run `npm run seed` first");
  }
  user.lastLoginAt = new Date();
  await user.save();
  res.status(200).json({ data: { user: toAuthUser(user) }, message: "Dev login" });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const profile = await loadProfile(req.user);
  res.status(200).json({
    data: { user: req.user, profile },
    message: "OK",
  });
});

// @route PUT /api/users/me
export const updateMe = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.status(200).json({ data: { user }, message: "Profile updated" });
});

// @route PUT /api/users/me/password  (staff)
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(422);
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id).select("+passwordHash");
  if (user.authProvider !== "password") {
    res.status(400);
    throw new Error("Password change is only for staff accounts");
  }

  const ok = await bcrypt.compare(currentPassword || "", user.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.status(200).json({ data: {}, message: "Password changed" });
});
