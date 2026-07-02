import path from "path";
import http from "http";
import { fileURLToPath } from "url";

import cors from "cors";
import express from "express";

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
import certificateRoutes from "./routes/certificateRoutes.js";
import liveClassRoutes from "./routes/liveClassRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import doubtRoutes from "./routes/doubtRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";

import { scheduleReconciliation } from "./cron/reconcilePayments.js";
import { scheduleLiveReminders } from "./cron/liveReminders.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

validateEnv();
await connectDB();

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "10mb" }));
app.use(cors(await getCorsOptions()));

// API
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/years", yearRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/live-classes", liveClassRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payouts", payoutRoutes);

// Production: serve the built Vite SPA
if (env.nodeEnv === "production") {
  const dist = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(dist));
  app.get("*", (_, res) => res.sendFile(path.join(dist, "index.html")));
} else {
  app.get("/", (_, res) => res.send("B.Sc Nepal API is running 🏃"));
}

app.use(NOT_FOUND_HANDLER);
app.use(ERROR_HANDLER);

server.listen(env.port, () =>
  console.log(`🚀 Server in ${env.nodeEnv} on port ${env.port}`)
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
