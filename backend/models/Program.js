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

    // How the program is divided. "yearly" programs sell a year at a time;
    // "semester" programs still hang off a year, but each year carries its own
    // semesters (Year 2 → Semester 3 and 4) that subjects are filed under.
    structure: {
      type: String,
      enum: ["yearly", "semester"],
      default: "yearly",
    },
    semestersPerYear: { type: Number, min: 1, max: 4, default: 2 },

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
