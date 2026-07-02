import mongoose from "mongoose";

const { Schema } = mongoose;

const ACTIONS = [
  // admin
  "create_teacher",
  "approve_teacher",
  "deactivate_user",
  "update_pricing",
  "create_subject",
  "update_subject",
  "delete_content",
  "view_report",
  "refund_order",
  "create_coupon",
  "update_coupon",
  "issue_certificate",
  "process_payout",
  "hide_review",
  // teacher
  "upload_content",
  "update_content",
  "create_live_class",
  "update_live_class",
  "cancel_live_class",
  "resolve_doubt",
];

const ActivityLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, enum: ["admin", "teacher"], required: true },
    action: { type: String, enum: ACTIONS, required: true },

    description: { type: String },
    targetType: { type: String },
    targetId: { type: Schema.Types.ObjectId },

    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed },
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ actor: 1, createdAt: -1 });
ActivityLogSchema.index({ targetType: 1, targetId: 1 });

export const ACTIVITY_ACTIONS = ACTIONS;
export default mongoose.model("ActivityLog", ActivityLogSchema);
