import mongoose from "mongoose";

const { Schema } = mongoose;

const SubjectSchema = new Schema(
  {
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    year: { type: Schema.Types.ObjectId, ref: "BScYear", required: true },
    semester: { type: Number, min: 1, max: 8 }, // optional; future-proofing

    subjectCode: { type: String },
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String, maxlength: 2000 },
    thumbnail: { type: String },

    category: {
      type: String,
      enum: ["Core", "Elective", "Practical", "Ability Enhancement"],
      default: "Core",
    },

    displayOrder: { type: Number, default: 0 },

    pricing: {
      originalPrice: { type: Number, required: true },
      discountedPrice: { type: Number, required: true },
      currency: { type: String, enum: ["NPR"], default: "NPR" },
      validityDays: { type: Number, default: 365 },
    },

    // cached counters
    totalChapters: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    totalPdfs: { type: Number, default: 0 },
    totalNotes: { type: Number, default: 0 },
    totalLiveClasses: { type: Number, default: 0 },

    // cached rating (kept in sync from Review — Part 6)
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    tags: [{ type: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

SubjectSchema.index({ year: 1, isActive: 1, displayOrder: 1 });
// slug + code unique per {program, year} (partial: ignore soft-deleted)
SubjectSchema.index(
  { program: 1, year: 1, slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
SubjectSchema.index(
  { program: 1, year: 1, subjectCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      subjectCode: { $type: "string" },
    },
  }
);
SubjectSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.model("Subject", SubjectSchema);
