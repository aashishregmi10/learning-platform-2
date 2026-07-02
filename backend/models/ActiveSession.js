import mongoose from "mongoose";

const { Schema } = mongoose;

const ActiveSessionSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deviceId: { type: String, required: true },
  deviceType: { type: String, enum: ["web", "android", "ios"] },
  ip: { type: String },
  userAgent: { type: String },
  lastSeenAt: { type: Date, default: Date.now },
});

ActiveSessionSchema.index({ student: 1, deviceId: 1 }, { unique: true });
// TTL: a session with no heartbeat for 6h is considered gone — frees the
// concurrency slot automatically for crashed/closed clients.
ActiveSessionSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: 21600 });

export default mongoose.model("ActiveSession", ActiveSessionSchema);
