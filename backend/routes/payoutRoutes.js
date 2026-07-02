import express from "express";

import { computePayouts, listPayouts, getPayout, updatePayout } from "../controllers/payoutController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/compute", protect, adminOnly, computePayouts);
router.get("/list", protect, adminOnly, listPayouts);
router.get("/:id", protect, adminOnly, getPayout);
router.patch("/:id", protect, adminOnly, updatePayout);

export default router;
