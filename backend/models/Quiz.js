import mongoose from "mongoose";

const { Schema } = mongoose;

const QuestionSchema = new Schema(
  {
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true }, // never sent to students pre-submit
    explanation: { type: String },
    points: { type: Number, default: 1 },
  },
  { _id: false }
);

const QuizSchema = new Schema(
  {
    chapter: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" }, // denormalized

    title: { type: String, required: true },
    description: { type: String },

    questions: [QuestionSchema],

    passingScore: { type: Number, default: 50 }, // percentage
    timeLimitMinutes: { type: Number },
    maxAttempts: { type: Number, default: 0 }, // 0 = unlimited

    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

QuizSchema.index({ chapter: 1 });

export default mongoose.model("Quiz", QuizSchema);
