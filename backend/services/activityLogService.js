import ActivityLog from "../models/ActivityLog.js";

/**
 * Reusable audit-log helper — call from every admin/teacher mutation.
 * Never throws: a logging failure must never break the mutation it's
 * observing.
 */
export const logActivity = async (
  actor,
  action,
  { targetType, targetId, before, after, description, req } = {}
) => {
  try {
    await ActivityLog.create({
      actor: actor._id || actor,
      actorRole: actor.role,
      action,
      description,
      targetType,
      targetId,
      changes: before !== undefined || after !== undefined ? { before, after } : undefined,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });
  } catch (err) {
    console.error("logActivity failed:", err.message);
  }
};
