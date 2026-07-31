import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    googleId: { type: String }, // students only — index declared below
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false }, // staff only
    authProvider: {
      type: String,
      enum: ["google", "password"],
      required: true,
    },
    // `name` stays the single source for display and search. Staff accounts are
    // created from parts, so those are kept alongside it; Google students only
    // ever hand us a full name, hence the parts are optional.
    name: { type: String, required: true },
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    surname: { type: String, trim: true },
    avatar: { type: String },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
      default: "student",
    },

    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    forceLogin: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Email is unique only among non-deleted users (partial index).
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });

export default mongoose.model("User", UserSchema);
