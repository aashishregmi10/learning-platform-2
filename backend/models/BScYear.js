import mongoose from "mongoose";

const { Schema } = mongoose;

const BScYearSchema = new Schema(
  {
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },

    yearNumber: { type: Number, required: true, min: 1, max: 4 },
    yearName: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },

    description: { type: String },
    thumbnail: { type: String },

    bundlePrice: {
      originalPrice: { type: Number, required: true },
      discountedPrice: { type: Number, required: true },
      currency: { type: String, enum: ["NPR"], default: "NPR" },
    },

    isActive: { type: Boolean, default: false },
    launchDate: { type: Date },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    totalSubjects: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// A year number is unique within its program (partial: ignore soft-deleted).
BScYearSchema.index(
  { program: 1, yearNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export default mongoose.model("BScYear", BScYearSchema);
