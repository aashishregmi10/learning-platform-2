import mongoose from "mongoose";

const { Schema } = mongoose;

const QuizAttemptSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },

    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOptionIndex: { type: Number },
        isCorrect: { type: Boolean },
      },
    ],

    score: { type: Number, required: true }, // percentage
    totalPoints: { type: Number },
    earnedPoints: { type: Number },
    passed: { type: Boolean },
    attemptNumber: { type: Number, required: true },

    startedAt: { type: Date },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

QuizAttemptSchema.index({ student: 1, quiz: 1, attemptNumber: 1 }, { unique: true });

export default mongoose.model("QuizAttempt", QuizAttemptSchema);
