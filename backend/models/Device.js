import mongoose from "mongoose";

const { Schema } = mongoose;

// Push tokens for ANY user (teachers and admins receive notifications too),
// kept out of StudentProfile so it isn't a student-only concern.
const DeviceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    deviceType: { type: String, enum: ["web", "android", "ios"] },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DeviceSchema.index({ user: 1, token: 1 }, { unique: true });

export default mongoose.model("Device", DeviceSchema);
