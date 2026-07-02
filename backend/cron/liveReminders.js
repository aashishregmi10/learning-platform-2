import LiveClass from "../models/LiveClass.js";
import Entitlement from "../models/Entitlement.js";
import { sendNotification } from "../services/notificationService.js";

const THRESHOLDS = [
  { field: "reminder24h", ms: 24 * 60 * 60 * 1000, label: "24 hours" },
  { field: "reminder1h", ms: 60 * 60 * 1000, label: "1 hour" },
  { field: "reminder15m", ms: 15 * 60 * 1000, label: "15 minutes" },
];

/**
 * Finds scheduled classes crossing each reminder threshold and notifies
 * entitled students exactly once (the notificationsSent.<field> flag makes
 * this idempotent even if the interval overlaps a run).
 */
export const runLiveReminders = async () => {
  const now = new Date();
  let sent = 0;

  for (const { field, ms, label } of THRESHOLDS) {
    const due = await LiveClass.find({
      status: "scheduled",
      scheduledAt: { $gt: now, $lte: new Date(now.getTime() + ms) },
      [`notificationsSent.${field}`]: false,
    }).populate("subject", "name");

    for (const liveClass of due) {
      const entitlements = await Entitlement.find({
        subject: liveClass.subject._id,
        isActive: true,
        expiresAt: { $gt: now },
      }).select("student");

      for (const { student } of entitlements) {
        await sendNotification({
          user: student,
          role: "student",
          title: `Live class in ${label}`,
          message: `${liveClass.title} (${liveClass.subject.name}) starts in ${label}.`,
          type: "live_class",
          actionUrl: "/app/student/live-classes",
          relatedLiveClass: liveClass._id,
        });
        sent++;
      }

      liveClass.notificationsSent[field] = true;
      await liveClass.save();
    }
  }

  if (sent) console.log(`🔔 liveReminders: sent ${sent} reminder notification(s)`);
  return sent;
};

/** Schedule the reminder loop (every 5 minutes). */
export const scheduleLiveReminders = () => {
  setInterval(() => {
    runLiveReminders().catch((e) => console.error("liveReminders error:", e.message));
  }, 5 * 60 * 1000);
};
