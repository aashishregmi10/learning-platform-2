import express from "express";

import { getDashboard, getMonitor } from "../controllers/adminDashboardController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboard);
router.get("/monitor/:resource", protect, adminOnly, getMonitor);

export default router;
