import mongoose from "mongoose";

const { Schema } = mongoose;

const SubscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    order: { type: Schema.Types.ObjectId, ref: "Order" },
    renewedFrom: { type: Schema.Types.ObjectId, ref: "Subscription" },
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon" },

    type: { type: String, enum: ["subject", "year", "program"], required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    year: { type: Schema.Types.ObjectId, ref: "BScYear" },
    program: { type: Schema.Types.ObjectId, ref: "Program" },

    price: {
      amount: { type: Number, required: true },
      currency: { type: String, enum: ["NPR"], default: "NPR" },
      originalAmount: { type: Number },
      discountApplied: { type: Number, default: 0 },
    },

    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending", "refunded"],
      default: "pending",
    },

    payment: {
      gateway: { type: String, enum: ["esewa", "khalti", "fonepay", "connectips"] },
      transactionRef: { type: String },
      paymentId: { type: String },
      paidAt: { type: Date },
    },

    refund: {
      isRefunded: { type: Boolean, default: false },
      amount: { type: Number },
      reason: { type: String },
      refundedAt: { type: Date },
      refundedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },

    invoiceUrl: { type: String },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ user: 1, status: 1, expiresAt: 1 });
SubscriptionSchema.index({ user: 1, type: 1, subject: 1 });
SubscriptionSchema.index({ order: 1 });

export default mongoose.model("Subscription", SubscriptionSchema);
