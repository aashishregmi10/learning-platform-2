import express from "express";

import {
  createLiveClass,
  listLiveClasses,
  listUpcomingForStudent,
  getLiveClass,
  updateLiveClass,
  cancelLiveClass,
  startLiveClass,
  endLiveClass,
  joinLiveClass,
  attendanceHeartbeat,
  getRecording,
  listAttendance,
} from "../controllers/liveClassController.js";
import { protect, staffOnly, studentOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/list", protect, staffOnly, listLiveClasses);
router.post("/", protect, staffOnly, createLiveClass);
router.get("/upcoming", protect, studentOnly, listUpcomingForStudent);

router.get("/:id/join", protect, studentOnly, joinLiveClass);
router.post("/:id/attendance/heartbeat", protect, studentOnly, attendanceHeartbeat);
router.get("/:id/recording", protect, studentOnly, getRecording);
router.get("/:id/attendance", protect, staffOnly, listAttendance);
router.patch("/:id/start", protect, staffOnly, startLiveClass);
router.patch("/:id/end", protect, staffOnly, endLiveClass);

router
  .route("/:id")
  .get(protect, staffOnly, getLiveClass)
  .put(protect, staffOnly, updateLiveClass)
  .delete(protect, staffOnly, cancelLiveClass);

export default router;
