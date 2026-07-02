import express from "express";
import asyncHandler from "express-async-handler";

import { env } from "../config/env.config.js";
import Order from "../models/Order.js";
import { initiateEsewa, esewaCallback } from "../controllers/paymentController.js";
import { fulfillOrder } from "../services/fulfillmentService.js";
import { protect, studentOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/esewa/initiate", protect, studentOnly, initiateEsewa);
router.get("/esewa/callback", esewaCallback); // public redirect target

// DEV-ONLY: simulate a successful payment without eSewa's interactive sandbox.
// Guarded to non-production so it can never fulfill orders in prod.
router.post(
  "/dev/complete/:orderId",
  protect,
  studentOnly,
  asyncHandler(async (req, res) => {
    if (env.nodeEnv === "production") {
      res.status(403);
      throw new Error("Disabled in production");
    }
    const order = await Order.findById(req.params.orderId);
    if (!order || !order.user.equals(req.user._id)) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.status === "pending") {
      order.status = "paid";
      order.payment.paidAt = new Date();
      order.payment.paymentId = "DEV-SIMULATED";
      await order.save();
    }
    const result = await fulfillOrder(order._id);
    res.status(200).json({ data: { order, result }, message: "Simulated payment completed" });
  })
);

export default router;
