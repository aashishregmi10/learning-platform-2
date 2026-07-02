import mongoose from "mongoose";

const { Schema } = mongoose;

const TeacherPayoutSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    attributedSubscriptions: { type: Number, default: 0 },
    attributedRevenue: { type: Number, default: 0 },
    revenueSharePercent: { type: Number },
    payoutAmount: { type: Number, required: true },
    currency: { type: String, enum: ["NPR"], default: "NPR" },

    status: { type: String, enum: ["pending", "processing", "paid", "failed"], default: "pending" },
    paidAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

TeacherPayoutSchema.index({ teacher: 1, periodStart: 1, periodEnd: 1 });

export default mongoose.model("TeacherPayout", TeacherPayoutSchema);
