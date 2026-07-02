import mongoose from "mongoose";

const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["subject", "teacher"], required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    teacher: { type: Schema.Types.ObjectId, ref: "User" },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    isVisible: { type: Boolean, default: true },

    response: {
      text: { type: String, maxlength: 1000 },
      respondedAt: { type: Date },
      respondedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ subject: 1, isVisible: 1 });
ReviewSchema.index({ teacher: 1, isVisible: 1 });
ReviewSchema.index(
  { student: 1, subject: 1 },
  { unique: true, partialFilterExpression: { targetType: "subject" } }
);
ReviewSchema.index(
  { student: 1, teacher: 1 },
  { unique: true, partialFilterExpression: { targetType: "teacher" } }
);

export default mongoose.model("Review", ReviewSchema);
