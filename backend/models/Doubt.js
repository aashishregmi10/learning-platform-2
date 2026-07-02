import mongoose from "mongoose";

const { Schema } = mongoose;

const DoubtSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorRole: { type: String, enum: ["student", "teacher"], required: true },

    chapter: { type: Schema.Types.ObjectId, ref: "Chapter" },
    liveClass: { type: Schema.Types.ObjectId, ref: "LiveClass" },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" }, // denormalized for subject-wide queries

    parentDoubt: { type: Schema.Types.ObjectId, ref: "Doubt" }, // null = top-level; set = one-level reply

    content: { type: String, required: true, maxlength: 2000 },

    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },

    upvoteCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DoubtSchema.index({ chapter: 1, createdAt: -1 });
DoubtSchema.index({ liveClass: 1, createdAt: -1 });
DoubtSchema.index({ subject: 1, createdAt: -1 });
DoubtSchema.index({ parentDoubt: 1 });

export default mongoose.model("Doubt", DoubtSchema);
