import mongoose from "mongoose";

const { Schema } = mongoose;

// The resolved access table. "Does this student have access to subject X?" is a
// single indexed lookup here (see utils/access.js). A subject purchase writes 1
// row; a year purchase writes 1 per subject in the program-year; a program
// purchase writes 1 per subject in the program.
const EntitlementSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },

    source: { type: String, enum: ["subject", "year", "program"], required: true },
    subscription: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },

    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EntitlementSchema.index({ student: 1, subject: 1, isActive: 1, expiresAt: 1 });

export default mongoose.model("Entitlement", EntitlementSchema);
