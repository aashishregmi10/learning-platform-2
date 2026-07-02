import express from "express";

import {
  createCoupon,
  listCoupons,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/list", protect, adminOnly, listCoupons);
router.post("/", protect, adminOnly, createCoupon);
router.route("/:id").put(protect, adminOnly, updateCoupon).delete(protect, adminOnly, deleteCoupon);

export default router;
