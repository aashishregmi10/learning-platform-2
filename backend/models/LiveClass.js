import mongoose from "mongoose";

const { Schema } = mongoose;

const LiveClassSchema = new Schema(
  {
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    description: { type: String },

    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true }, // minutes
    timezone: { type: String, default: "Asia/Kathmandu" },

    audience: { type: String, enum: ["paid", "free"], default: "paid" },

    // App-layer secret; never sent to students directly — join mints a
    // per-student token instead of exposing this.
    meetingLink: { type: String },
    meetingPassword: { type: String },

    recording: {
      isAvailable: { type: Boolean, default: false },
      storage: {
        provider: { type: String, enum: ["cloudinary", "s3", "cloudflare-stream", "gumlet", "bunny", "local"] },
        fileKey: { type: String },
      },
      durationSeconds: { type: Number },
      uploadedAt: { type: Date },
    },

    attendeeCount: { type: Number, default: 0 },

    status: { type: String, enum: ["scheduled", "live", "ended", "cancelled"], default: "scheduled" },

    notificationsSent: {
      reminder24h: { type: Boolean, default: false },
      reminder1h: { type: Boolean, default: false },
      reminder15m: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

LiveClassSchema.index({ subject: 1, scheduledAt: 1 });
LiveClassSchema.index({ status: 1, scheduledAt: 1 });

export default mongoose.model("LiveClass", LiveClassSchema);
