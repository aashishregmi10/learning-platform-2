import mongoose from "mongoose";

const { Schema } = mongoose;

const StudentProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // The student's enrolled major — drives which catalog they see (Part 2).
    program: { type: Schema.Types.ObjectId, ref: "Program" },

    currentYear: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
      default: "1st Year",
    },
    university: { type: String, default: "Tribhuvan University" },

    maxConcurrentDevices: { type: Number, default: 2 },

    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },

    // Cold counters — computed by scheduled rollups, not on every write.
    totalWatchTime: { type: Number, default: 0 }, // minutes
    completedChaptersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("StudentProfile", StudentProfileSchema);
