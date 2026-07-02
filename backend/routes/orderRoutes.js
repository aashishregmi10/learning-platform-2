import express from "express";

import {
  createOrder,
  validateCoupon,
  listMyOrders,
  getOrder,
  listMySubscriptions,
  listMyEntitlements,
} from "../controllers/orderController.js";
import { refundOrder } from "../controllers/paymentController.js";
import { protect, studentOnly, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, studentOnly, createOrder);
router.get("/mine", protect, studentOnly, listMyOrders);
router.get("/:id", protect, getOrder);
router.post("/:id/refund", protect, adminOnly, refundOrder);

// mounted under /api/orders for now; convenience sub-routes:
router.post("/coupons/validate", protect, studentOnly, validateCoupon);
router.get("/me/subscriptions", protect, studentOnly, listMySubscriptions);
router.get("/me/entitlements", protect, studentOnly, listMyEntitlements);

export default router;
