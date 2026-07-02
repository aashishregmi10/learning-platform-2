import Subject from "../models/Subject.js";
import BScYear from "../models/BScYear.js";
import Program from "../models/Program.js";
import Coupon from "../models/Coupon.js";
import CouponRedemption from "../models/CouponRedemption.js";

/**
 * Re-price a cart from live DB records (never trust client prices). Returns
 * order items with price snapshots + subtotal.
 */
export const priceCart = async (cartItems = []) => {
  const items = [];
  for (const ci of cartItems) {
    if (ci.itemType === "subject") {
      const s = await Subject.findOne({ _id: ci.subject, isDeleted: false });
      if (!s) throw new Error("Subject not found");
      items.push({ itemType: "subject", subject: s._id, title: s.name, originalPrice: s.pricing.originalPrice, discountedPrice: s.pricing.discountedPrice });
    } else if (ci.itemType === "year") {
      const y = await BScYear.findOne({ _id: ci.year, isDeleted: false });
      if (!y) throw new Error("Year not found");
      items.push({ itemType: "year", year: y._id, title: y.yearName, originalPrice: y.bundlePrice.originalPrice, discountedPrice: y.bundlePrice.discountedPrice });
    } else if (ci.itemType === "program") {
      const p = await Program.findOne({ _id: ci.program, isDeleted: false });
      if (!p) throw new Error("Program not found");
      // program price = sum of its years' bundle prices (simple model)
      const years = await BScYear.find({ program: p._id, isDeleted: false });
      const original = years.reduce((a, y) => a + y.bundlePrice.originalPrice, 0);
      const discounted = years.reduce((a, y) => a + y.bundlePrice.discountedPrice, 0);
      items.push({ itemType: "program", program: p._id, title: `${p.name} (full program)`, originalPrice: original, discountedPrice: discounted });
    } else {
      throw new Error("Invalid item type");
    }
  }
  const subtotal = items.reduce((a, it) => a + it.discountedPrice, 0);
  return { items, subtotal };
};

const itemMatchesCoupon = (item, coupon) => {
  if (coupon.appliesTo === "all") return true;
  if (coupon.appliesTo !== item.itemType) return false;
  if (item.itemType === "subject") return coupon.applicableSubjects.some((id) => id.equals(item.subject));
  if (item.itemType === "year") return coupon.applicableYears.some((id) => id.equals(item.year));
  if (item.itemType === "program") return coupon.applicablePrograms.some((id) => id.equals(item.program));
  return false;
};

/**
 * Validate a coupon against a priced cart + user. Returns { coupon, discount }
 * or throws a user-facing Error.
 */
export const applyCoupon = async ({ code, items, subtotal, userId }) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new Error("Invalid coupon code");

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) throw new Error("Coupon not active yet");
  if (coupon.validUntil && now > coupon.validUntil) throw new Error("Coupon has expired");
  if (subtotal < (coupon.minOrderAmount || 0)) throw new Error(`Minimum order NPR ${coupon.minOrderAmount} required`);

  if (coupon.maxRedemptions && coupon.redemptionCount >= coupon.maxRedemptions)
    throw new Error("Coupon redemption limit reached");

  const usedByUser = await CouponRedemption.countDocuments({ coupon: coupon._id, user: userId });
  if (usedByUser >= (coupon.perUserLimit || 1)) throw new Error("You have already used this coupon");

  // eligible amount = sum of matching items
  const eligible = items.filter((it) => itemMatchesCoupon(it, coupon)).reduce((a, it) => a + it.discountedPrice, 0);
  if (eligible <= 0) throw new Error("Coupon does not apply to these items");

  let discount =
    coupon.discountType === "percentage"
      ? Math.round((eligible * coupon.discountValue) / 100)
      : Math.min(coupon.discountValue, eligible);

  return { coupon, discount };
};
