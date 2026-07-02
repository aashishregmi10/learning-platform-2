import mongoose from "mongoose";

const { Schema } = mongoose;

const ChapterSchema = new Schema(
  {
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },

    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true },
    slug: { type: String },
    description: { type: String },

    learningObjectives: [{ type: String }],
    topics: [{ type: String }],

    estimatedDuration: { type: Number }, // minutes

    // Single source of truth for free-preview access: unlocks ALL content
    // in this chapter regardless of Content.isFree.
    isFreePreview: { type: Boolean, default: false },

    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    videoCount: { type: Number, default: 0 },
    pdfCount: { type: Number, default: 0 },
    noteCount: { type: Number, default: 0 },
    quizCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChapterSchema.index({ subject: 1, chapterNumber: 1 });

export default mongoose.model("Chapter", ChapterSchema);
