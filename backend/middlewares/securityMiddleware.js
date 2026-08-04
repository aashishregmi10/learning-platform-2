import rateLimit from "express-rate-limit";

import { env } from "../config/env.config.js";

/**
 * Rate limits.
 *
 * Tiered rather than one global cap: a student flicking through lessons makes
 * far more requests than someone guessing passwords, so a single limit would
 * either be useless against brute force or break normal reading.
 *
 * `trust proxy` must be set on the app for these to key on the real client IP
 * behind a host like Render or Nginx — otherwise every request looks like it
 * comes from the proxy and one attacker locks out everybody.
 */
const limiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // Never rate-limit ourselves during local development.
    skip: () => env.nodeEnv !== "production" && process.env.RATE_LIMIT_IN_DEV !== "true",
    message: { message },
  });

/** Login / token endpoints — the brute-force surface. */
export const authLimiter = limiter(
  15 * 60 * 1000,
  20,
  "Too many sign-in attempts. Please wait a few minutes and try again."
);

/** Payment + order creation — abuse here costs real money. */
export const paymentLimiter = limiter(
  15 * 60 * 1000,
  30,
  "Too many payment attempts. Please wait a few minutes."
);

/** Uploads — large multipart bodies are the cheapest way to exhaust us. */
export const uploadLimiter = limiter(
  60 * 60 * 1000,
  60,
  "Upload limit reached. Please try again later."
);

/** Everything else — generous, only there to blunt scripted scraping. */
export const apiLimiter = limiter(
  15 * 60 * 1000,
  1000,
  "Too many requests. Please slow down."
);
