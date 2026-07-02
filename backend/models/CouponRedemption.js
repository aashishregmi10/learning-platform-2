import mongoose from "mongoose";

const { Schema } = mongoose;

// Tracked separately from Order so "has this user used this coupon, how often"
// is an indexed lookup instead of scanning every Order.
const CouponRedemptionSchema = new Schema(
  {
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    discountApplied: { type: Number, required: true },
  },
  { timestamps: true }
);

CouponRedemptionSchema.index({ coupon: 1, user: 1 });

export default mongoose.model("CouponRedemption", CouponRedemptionSchema);
