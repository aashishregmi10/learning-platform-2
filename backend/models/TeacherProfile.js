import mongoose from "mongoose";

const { Schema } = mongoose;

const TeacherProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    qualification: { type: String },
    specialization: { type: String },
    bio: { type: String, maxlength: 1000 },
    experience: { type: Number },

    // Source of truth for the teacher <-> subject relationship.
    // Subject (Part 2) does NOT mirror a `teachers` array.
    assignedSubjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],

    payoutDetails: {
      method: { type: String, enum: ["bank_transfer", "esewa", "khalti"] },
      accountHolderName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      branchOrIfsc: { type: String },
    },

    // Cached counters — maintained in service functions (Parts 2/5).
    totalCourses: { type: Number, default: 0 },
    totalLiveClasses: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },

    // Cached rating (kept in sync from Review — Part 6)
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    isApproved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

TeacherProfileSchema.index({ assignedSubjects: 1 });

export default mongoose.model("TeacherProfile", TeacherProfileSchema);
