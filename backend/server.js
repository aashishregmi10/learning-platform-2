import path from "path";
import http from "http";
import { fileURLToPath } from "url";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";

import { env, validateEnv } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { getCorsOptions } from "./config/cors.config.js";
import {
  ERROR_HANDLER,
  NOT_FOUND_HANDLER,
} from "./middlewares/errorMiddleware.js";

// routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import yearRoutes from "./routes/yearRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import chapterRoutes from "./routes/chapterRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import liveClassRoutes from "./routes/liveClassRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import doubtRoutes from "./routes/doubtRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";

import {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  uploadLimiter,
} from "./middlewares/securityMiddleware.js";
import { scheduleReconciliation } from "./cron/reconcilePayments.js";
import { scheduleLiveReminders } from "./cron/liveReminders.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

validateEnv();
await connectDB();

const app = express();
const server = http.createServer(app);

// Behind Render/Nginx the real client IP is in X-Forwarded-For. Without this
// the rate limiters key every request to the proxy and one abuser locks out
// every user at once.
app.set("trust proxy", 1);

/**
 * Security headers.
 *
 * The API serves JSON and (in production) the built SPA, so the CSP has to
 * cover both. `connect-src` includes the configured client origins so the
 * frontend can call us cross-origin; `img-src` allows Cloudinary and data:
 * URIs because note images and avatars come from there.
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        // MUI/emotion inject styles at runtime, so style-src needs 'unsafe-inline'.
        // Scripts deliberately do NOT get that escape hatch.
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
        mediaSrc: ["'self'", "blob:", "https://res.cloudinary.com"],
        frameSrc: ["https://accounts.google.com", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
        connectSrc: ["'self'", ...env.clientOrigins, "https://accounts.google.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"], // clickjacking
        upgradeInsecureRequests: env.nodeEnv === "production" ? [] : null,
      },
    },
    // Cloudinary media is loaded cross-origin; the strictest COEP would block it.
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: env.nodeEnv === "production" ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);

// 10mb covers a long note with embedded image URLs; files go through multer,
// not JSON, so this does not need to accommodate uploads.
app.use(express.json({ limit: "10mb" }));
app.use(cors(await getCorsOptions()));

// Strips $-prefixed keys and dots so a body like { email: { $ne: null } } can
// never reach a Mongo query as an operator.
app.use(mongoSanitize({ replaceWith: "_" }));
// Collapses duplicated query params (?role=student&role=admin) to one value,
// which otherwise arrive as arrays and defeat naive equality checks.
app.use(hpp());

// Baseline limiter for the whole API; auth gets a much tighter one below.
app.use("/api", apiLimiter);

// API
app.use("/api/health", healthRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/years", yearRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/contents", uploadLimiter, contentRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/orders", paymentLimiter, orderRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/live-classes", liveClassRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payouts", payoutRoutes);

// Production: serve the built Vite SPA
// if (env.nodeEnv === "production") {
//   const dist = path.resolve(__dirname, "../frontend/dist");
//   app.use(express.static(dist));
//   app.get("*", (_, res) => res.sendFile(path.join(dist, "index.html")));
// } else {
//   app.get("/", (_, res) => res.send("Atomica Academy Nepal API is running 🏃"));
// }

// ✅ KEEP ONLY THIS::
app.get("/", (_, res) => res.send("Atomica Academy Nepal API is running 🏃"));

app.use(NOT_FOUND_HANDLER);
app.use(ERROR_HANDLER);

server.listen(env.port, () =>
  console.log(`🚀 Server in ${env.nodeEnv} on port ${env.port}`),
);

// payment reconciliation safety net
scheduleReconciliation();
scheduleLiveReminders();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
