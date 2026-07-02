import asyncHandler from "express-async-handler";

import { env } from "../config/env.config.js";
import Order from "../models/Order.js";
import Subscription from "../models/Subscription.js";
import Entitlement from "../models/Entitlement.js";
import PaymentEvent from "../models/PaymentEvent.js";
import {
  buildEsewaFormFields,
  lookupEsewaStatus,
  decodeEsewaCallback,
} from "../utils/esewa.js";
import { fulfillOrder } from "../services/fulfillmentService.js";
import { logActivity } from "../services/activityLogService.js";

const genInvoiceNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `PT-${ymd}-${Math.floor(10000 + Math.random() * 89999)}`;
};

// @route POST /api/payments/esewa/initiate  (student) — returns form fields
export const initiateEsewa = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order || !order.user.equals(req.user._id)) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.status !== "pending") {
    res.status(400);
    throw new Error(`Order is already ${order.status}`);
  }

  const successUrl = `${env.apiBaseUrl}/api/payments/esewa/callback?orderId=${order._id}`;
  const failureUrl = `${env.clientBaseUrl}/app/student/orders/${order._id}?status=failed`;

  const fields = buildEsewaFormFields({ order, successUrl, failureUrl });

  res.status(200).json({
    data: { esewaUrl: env.esewa.formUrl, fields },
    message: "OK",
  });
});

/**
 * Shared: verify a transaction server-side and fulfill. Idempotent.
 * Returns { ok, order }.
 */
const verifyAndFulfill = async ({ order, refId, rawPayload }) => {
  const transactionUuid = order.payment.transactionRef;

  // idempotency: record the event first, keyed on the gateway ref
  let event = await PaymentEvent.findOne({ eventId: transactionUuid });
  if (event?.status === "processed") return { ok: order.status === "paid", order, duplicate: true };
  if (!event) {
    event = await PaymentEvent.create({
      eventId: transactionUuid,
      gateway: "esewa",
      eventType: "payment.callback",
      order: order._id,
      rawPayload,
      status: "verifying",
    });
  }

  // server-to-server status lookup (source of truth)
  let status;
  try {
    status = await lookupEsewaStatus({ totalAmount: order.totalAmount, transactionUuid });
  } catch (err) {
    event.status = "failed";
    event.errorMessage = err.message;
    await event.save();
    return { ok: false, order, error: err.message };
  }

  const paid = status?.status === "COMPLETE" && Number(status?.total_amount) === Number(order.totalAmount);

  if (!paid) {
    event.status = "failed";
    event.errorMessage = `eSewa status: ${status?.status}`;
    await event.save();
    if (order.status === "pending") {
      order.status = "failed";
      await order.save();
    }
    return { ok: false, order };
  }

  event.status = "processed";
  event.verifiedAt = new Date();
  event.verificationMethod = "server_lookup";
  event.processedAt = new Date();
  await event.save();

  if (order.status !== "paid") {
    order.status = "paid";
    order.payment.paymentId = refId || status?.ref_id;
    order.payment.paidAt = new Date();
    order.paymentEvent = event._id;
    if (!order.invoiceNumber) order.invoiceNumber = genInvoiceNumber();
    await order.save();
  }

  await fulfillOrder(order._id);
  return { ok: true, order };
};

export { verifyAndFulfill };

// @route GET /api/payments/esewa/callback?orderId=&data=  (public redirect target)
export const esewaCallback = asyncHandler(async (req, res) => {
  const { orderId, data } = req.query;
  const order = await Order.findById(orderId);
  const redirect = (status) =>
    res.redirect(`${env.clientBaseUrl}/app/student/orders/${orderId}?status=${status}`);

  if (!order) return redirect("notfound");

  const decoded = data ? decodeEsewaCallback(data) : null;
  const result = await verifyAndFulfill({
    order,
    refId: decoded?.transaction_code || decoded?.ref_id,
    rawPayload: decoded || req.query,
  });

  return redirect(result.ok ? "paid" : "failed");
});

// @route POST /api/orders/:id/refund  (admin)
export const refundOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order || order.status !== "paid") {
    res.status(404);
    throw new Error("Paid order not found");
  }

  await Subscription.updateMany(
    { order: order._id },
    {
      status: "refunded",
      "refund.isRefunded": true,
      "refund.amount": order.totalAmount,
      "refund.reason": reason,
      "refund.refundedAt": new Date(),
      "refund.refundedBy": req.user._id,
    }
  );

  const subs = await Subscription.find({ order: order._id }).select("_id");
  await Entitlement.updateMany(
    { subscription: { $in: subs.map((s) => s._id) } },
    { isActive: false }
  );

  order.status = "refunded";
  await order.save();

  await logActivity(req.user, "refund_order", {
    targetType: "Order",
    targetId: order._id,
    before: { status: "paid" },
    after: { status: "refunded", reason },
    req,
  });

  res.status(200).json({ data: order, message: "Order refunded, access revoked" });
});
