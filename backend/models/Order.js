import mongoose from "mongoose";

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    itemType: { type: String, enum: ["subject", "year", "program"], required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    year: { type: Schema.Types.ObjectId, ref: "BScYear" },
    program: { type: Schema.Types.ObjectId, ref: "Program" },
    title: { type: String }, // snapshot label
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    items: [OrderItemSchema],

    coupon: { type: Schema.Types.ObjectId, ref: "Coupon" },

    subtotal: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, enum: ["NPR"], default: "NPR" },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },

    payment: {
      gateway: {
        type: String,
        enum: ["esewa", "khalti", "fonepay", "connectips"],
        default: "esewa",
      },
      transactionRef: { type: String }, // eSewa transaction_uuid
      paymentId: { type: String }, // eSewa ref_id
      paidAt: { type: Date },
    },

    paymentEvent: { type: Schema.Types.ObjectId, ref: "PaymentEvent" },

    // Set true once fulfillment (subscriptions + entitlements) has completed —
    // the reconciliation job looks for paid orders where this is still false.
    fulfilledAt: { type: Date },

    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceUrl: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, status: 1, createdAt: -1 });
OrderSchema.index({ "payment.transactionRef": 1 });

export default mongoose.model("Order", OrderSchema);
