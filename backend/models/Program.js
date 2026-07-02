import mongoose from "mongoose";

const { Schema } = mongoose;

// Top of the hierarchy: a B.Sc major/combination (CSIT, Microbiology, PCM…).
const ProgramSchema = new Schema(
  {
    name: { type: String, required: true }, // "B.Sc CSIT"
    slug: { type: String, required: true },
    code: { type: String },
    description: { type: String, maxlength: 2000 },
    thumbnail: { type: String },
    durationYears: { type: Number, default: 4 },

    isActive: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    totalStudents: { type: Number, default: 0 }, // cached
  },
  { timestamps: true }
);

ProgramSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export default mongoose.model("Program", ProgramSchema);
