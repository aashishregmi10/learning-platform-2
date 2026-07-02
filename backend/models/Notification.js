import mongoose from "mongoose";

const { Schema } = mongoose;

const DeliverySchema = new Schema(
  {
    delivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    failed: { type: Boolean, default: false },
    failReason: { type: String },
  },
  { _id: false }
);

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["live_class", "new_content", "subscription", "system", "promotion"],
      required: true,
    },
    actionUrl: { type: String },
    relatedLiveClass: { type: Schema.Types.ObjectId, ref: "LiveClass" },
    relatedContent: { type: Schema.Types.ObjectId, ref: "Content" },

    channels: {
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    delivery: {
      push: { type: DeliverySchema, default: () => ({}) },
      email: { type: DeliverySchema, default: () => ({}) },
      inApp: { type: DeliverySchema, default: () => ({}) },
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);
