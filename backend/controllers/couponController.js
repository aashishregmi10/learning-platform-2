import asyncHandler from "express-async-handler";

import Coupon from "../models/Coupon.js";
import { facetPaginate, searchMatch } from "../utils/paginate.js";

// @route POST /api/coupons  (admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const body = { ...req.body, code: req.body.code?.toUpperCase(), createdBy: req.user._id };
  if (!body.code || !body.discountType || body.discountValue == null) {
    res.status(422);
    throw new Error("code, discountType and discountValue are required");
  }
  const coupon = await Coupon.create(body);
  res.status(201).json({ data: coupon, message: "Coupon created" });
});

// @route GET /api/coupons/list  (admin)
export const listCoupons = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const { data, totalItems } = await facetPaginate(Coupon, {
    match: { ...searchMatch("code", search?.toUpperCase()) },
    sort: { createdAt: -1 },
    page,
    limit,
  });
  res.status(200).json({ data, totalItems, message: "OK" });
});

// @route PUT /api/coupons/:id  (admin)
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  Object.assign(coupon, req.body);
  if (req.body.code) coupon.code = req.body.code.toUpperCase();
  await coupon.save();
  res.status(200).json({ data: coupon, message: "Coupon updated" });
});

// @route DELETE /api/coupons/:id  (admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndUpdate(req.params.id, { isActive: false });
  res.status(200).json({ data: {}, message: "Coupon deactivated" });
});
