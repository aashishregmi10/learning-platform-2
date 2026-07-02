import mongoose from "mongoose";

const { Schema } = mongoose;

const CertificateSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },

    certificateNumber: { type: String, required: true, unique: true },
    completionPercentage: { type: Number, default: 100 },
    issuedAt: { type: Date, default: Date.now },

    storage: {
      provider: { type: String, enum: ["cloudinary", "s3", "local"] },
      fileKey: { type: String },
    },
    templateVersion: { type: String, default: "v1" },
  },
  { timestamps: true }
);

CertificateSchema.index({ student: 1, subject: 1 }, { unique: true });

export default mongoose.model("Certificate", CertificateSchema);
