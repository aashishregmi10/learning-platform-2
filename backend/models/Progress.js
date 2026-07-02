import mongoose from "mongoose";

const { Schema } = mongoose;

const ProgressSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" }, // denormalized for rollups

    watchTime: { type: Number, default: 0 }, // seconds
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    lastPosition: { type: Number, default: 0 },

    isDownloaded: { type: Boolean, default: false },
    downloadedAt: { type: Date },
  },
  { timestamps: true }
);

ProgressSchema.index({ student: 1, content: 1 }, { unique: true });
ProgressSchema.index({ student: 1, isCompleted: 1 });
ProgressSchema.index({ student: 1, subject: 1 });

export default mongoose.model("Progress", ProgressSchema);
