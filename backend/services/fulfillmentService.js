import Order from "../models/Order.js";
import Subscription from "../models/Subscription.js";
import Entitlement from "../models/Entitlement.js";
import Subject from "../models/Subject.js";
import CouponRedemption from "../models/CouponRedemption.js";
import Coupon from "../models/Coupon.js";

const addDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

/** Resolve which subject ids an order item grants access to. */
const subjectsForItem = async (item) => {
  if (item.itemType === "subject") return [item.subject];
  if (item.itemType === "year") {
    const subs = await Subject.find({ year: item.year, isDeleted: false }).select("_id");
    return subs.map((s) => s._id);
  }
  if (item.itemType === "program") {
    const subs = await Subject.find({ program: item.program, isDeleted: false }).select("_id");
    return subs.map((s) => s._id);
  }
  return [];
};

/** Upsert an entitlement, extending expiry if an active row already exists. */
const grantEntitlement = async ({ student, subject, source, subscriptionId, expiresAt }) => {
  const existing = await Entitlement.findOne({ student, subject, isActive: true });
  if (existing) {
    if (existing.expiresAt < expiresAt) {
      existing.expiresAt = expiresAt;
      existing.subscription = subscriptionId;
      existing.source = source;
      await existing.save();
    }
    return existing;
  }
  return Entitlement.create({ student, subject, source, subscription: subscriptionId, expiresAt });
};

/**
 * Idempotent fulfillment for a PAID order. Safe to run multiple times
 * (reconciliation calls it too). Writes one Subscription per item and expands
 * Entitlements; marks order.fulfilledAt when complete.
 */
export const fulfillOrder = async (orderId) => {
  const order = await Order.findById(orderId).populate("items.subject items.year items.program");
  if (!order || order.status !== "paid") return { skipped: true };
  if (order.fulfilledAt) return { alreadyFulfilled: true };

  for (const item of order.items) {
    const validityDays =
      item.itemType === "subject" ? item.subject?.pricing?.validityDays || 365 : 365;
    const expiresAt = addDays(validityDays);

    // one subscription per item (idempotent by order+type+ref)
    const ref =
      item.itemType === "subject" ? item.subject?._id : item.itemType === "year" ? item.year?._id : item.program?._id;
    let sub = await Subscription.findOne({
      order: order._id,
      type: item.itemType,
      ...(item.itemType === "subject" && { subject: ref }),
      ...(item.itemType === "year" && { year: ref }),
      ...(item.itemType === "program" && { program: ref }),
    });
    if (!sub) {
      sub = await Subscription.create({
        user: order.user,
        order: order._id,
        coupon: order.coupon,
        type: item.itemType,
        subject: item.itemType === "subject" ? ref : undefined,
        year: item.itemType === "year" ? ref : undefined,
        program: item.itemType === "program" ? ref : undefined,
        price: { amount: item.discountedPrice, originalAmount: item.originalPrice },
        startedAt: new Date(),
        expiresAt,
        status: "active",
        payment: {
          gateway: order.payment.gateway,
          transactionRef: order.payment.transactionRef,
          paymentId: order.payment.paymentId,
          paidAt: order.payment.paidAt,
        },
      });
    }

    const subjectIds = await subjectsForItem(item);
    for (const subjectId of subjectIds) {
      await grantEntitlement({
        student: order.user,
        subject: subjectId,
        source: item.itemType,
        subscriptionId: sub._id,
        expiresAt,
      });
    }
  }

  // record coupon redemption once
  if (order.coupon) {
    const already = await CouponRedemption.findOne({ order: order._id });
    if (!already) {
      await CouponRedemption.create({
        coupon: order.coupon,
        user: order.user,
        order: order._id,
        discountApplied: order.couponDiscount,
      });
      await Coupon.findByIdAndUpdate(order.coupon, { $inc: { redemptionCount: 1 } });
    }
  }

  order.fulfilledAt = new Date();
  await order.save();
  return { fulfilled: true };
};
