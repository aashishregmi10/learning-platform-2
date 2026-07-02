import mongoose from "mongoose";

const { Schema } = mongoose;

const AttendanceSchema = new Schema(
  {
    liveClass: { type: Schema.Types.ObjectId, ref: "LiveClass", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    joinedAt: { type: Date, required: true },
    leftAt: { type: Date },
    totalDurationMinutes: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

AttendanceSchema.index({ liveClass: 1, student: 1 }, { unique: true });
AttendanceSchema.index({ student: 1, createdAt: -1 });

export default mongoose.model("Attendance", AttendanceSchema);
