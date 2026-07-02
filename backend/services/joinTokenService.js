import jwt from "jsonwebtoken";

import { env } from "../config/env.config.js";

const JOIN_TTL_SECONDS = 300;

/** Mint a short-lived, per-student join token — never expose meetingPassword. */
export const mintJoinToken = ({ liveClassId, studentId }) =>
  jwt.sign({ purpose: "live-join", liveClassId: String(liveClassId), studentId: String(studentId) }, env.jwtSecret, {
    expiresIn: JOIN_TTL_SECONDS,
  });

export const JOIN_TOKEN_TTL_SECONDS = JOIN_TTL_SECONDS;
