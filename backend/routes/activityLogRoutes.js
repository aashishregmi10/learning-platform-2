import express from "express";

import { listActivityLogs } from "../controllers/activityLogController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, listActivityLogs);

export default router;
