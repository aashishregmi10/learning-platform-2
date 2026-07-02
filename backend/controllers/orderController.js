import asyncHandler from "express-async-handler";
import { randomUUID } from "crypto";

import Order from "../models/Order.js";
import Subscription from "../models/Subscription.js";
import Entitlement from "../models/Entitlement.js";
import { facetPaginate } from "../utils/paginate.js";
import { priceCart, applyCoupon } from "../services/pricingService.js";

// @route POST /api/orders  (student) — create a pending order from cart
export const createOrder = asyncHandler(async (req, res) => {
  const { items: cart, couponCode } = req.body;
  if (!cart?.length) {
    res.status(422);
    throw new Error("Cart is empty");
  }

  const { items, subtotal } = await priceCart(cart);

  let coupon = null;
  let couponDiscount = 0;
  if (couponCode) {
    const applied = await applyCoupon({ code: couponCode, items, subtotal, userId: req.user._id });
    coupon = applied.coupon._id;
    couponDiscount = applied.discount;
  }

  const taxAmount = 0; // digital education; adjust if VAT is registered
  const totalAmount = subtotal - couponDiscount + taxAmount;

  const order = await Order.create({
    user: req.user._id,
    items,
    coupon,
    subtotal,
    couponDiscount,
    taxAmount,
    totalAmount,
    status: "pending",
    payment: { gateway: "esewa", transactionRef: randomUUID() },
  });

  res.status(201).json({ data: order, message: "Order created" });
});

// @route POST /api/coupons/validate  (student) — preview discount
export const validateCoupon = asyncHandler(async (req, res) => {
  const { items: cart, code } = req.body;
  const { items, subtotal } = await priceCart(cart || []);
  const { coupon, discount } = await applyCoupon({ code, items, subtotal, userId: req.user._id });
  res.status(200).json({
    data: { code: coupon.code, discount, subtotal, total: subtotal - discount },
    message: "Coupon applied",
  });
});

// @route GET /api/orders/mine  (student)
export const listMyOrders = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { data, totalItems } = await facetPaginate(Order, {
    match: { user: req.user._id },
    sort: { createdAt: -1 },
    page,
    limit,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route GET /api/orders/:id  (owner or admin)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("coupon", "code");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (req.user.role !== "admin" && !order.user.equals(req.user._id)) {
    res.status(403);
    throw new Error("Not your order");
  }
  res.status(200).json({ data: order, message: "OK" });
});

// @route GET /api/subscriptions/mine  (student)
export const listMySubscriptions = asyncHandler(async (req, res) => {
  const subs = await Subscription.find({ user: req.user._id })
    .populate("subject", "name slug")
    .populate("year", "yearName")
    .populate("program", "name")
    .sort({ createdAt: -1 });
  res.status(200).json({ data: subs, message: "OK" });
});

// @route GET /api/entitlements/mine  (student)
export const listMyEntitlements = asyncHandler(async (req, res) => {
  const ents = await Entitlement.find({ student: req.user._id, isActive: true })
    .populate("subject", "name slug")
    .sort({ expiresAt: -1 });
  res.status(200).json({ data: ents, message: "OK" });
});
