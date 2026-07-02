import mongoose from "mongoose";

const { Schema } = mongoose;

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },

    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true },

    appliesTo: {
      type: String,
      enum: ["subject", "year", "program", "all"],
      default: "all",
    },
    applicableSubjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    applicableYears: [{ type: Schema.Types.ObjectId, ref: "BScYear" }],
    applicablePrograms: [{ type: Schema.Types.ObjectId, ref: "Program" }],

    minOrderAmount: { type: Number, default: 0 },
    maxRedemptions: { type: Number }, // unset/0 = unlimited
    redemptionCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },

    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CouponSchema.index({ isActive: 1, validUntil: 1 });

export default mongoose.model("Coupon", CouponSchema);
