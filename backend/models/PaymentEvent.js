import mongoose from "mongoose";

const { Schema } = mongoose;

// Webhook/callback idempotency + audit. Store the gateway's reference before
// doing anything; a duplicate delivery fails the unique insert and is treated
// as "already processed".
const PaymentEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true }, // gateway ref (eSewa transaction_uuid)
    gateway: {
      type: String,
      enum: ["esewa", "khalti", "fonepay", "connectips"],
      required: true,
    },
    eventType: { type: String, required: true },

    order: { type: Schema.Types.ObjectId, ref: "Order" },
    subscription: { type: Schema.Types.ObjectId, ref: "Subscription" },
    rawPayload: { type: Schema.Types.Mixed },

    status: {
      type: String,
      enum: ["received", "verifying", "processed", "failed"],
      default: "received",
    },

    // Set ONLY after a server-to-server status lookup confirms payment.
    verifiedAt: { type: Date },
    verificationMethod: { type: String, enum: ["server_lookup", "manual"] },

    processedAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentEvent", PaymentEventSchema);
