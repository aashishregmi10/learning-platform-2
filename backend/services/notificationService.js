import Notification from "../models/Notification.js";
import Device from "../models/Device.js";
import StudentProfile from "../models/StudentProfile.js";

const defaultChannelsFor = async (userId, role) => {
  if (role !== "student") return { push: true, email: true, inApp: true };
  const profile = await StudentProfile.findOne({ user: userId }).select("notificationPreferences");
  const prefs = profile?.notificationPreferences || {};
  return { push: prefs.push !== false, email: prefs.email !== false, inApp: true };
};

/**
 * Create a Notification and simulate fan-out delivery per channel. Each
 * channel's outcome is recorded independently — a push failure never blocks
 * email/in-app, and vice versa (no real push/email provider is wired yet,
 * so delivery is simulated: push "fails" when the user has no registered
 * device, email/in-app simulate success).
 */
export const sendNotification = async ({
  user,
  role,
  title,
  message,
  type,
  actionUrl,
  relatedLiveClass,
  relatedContent,
  channels,
}) => {
  const resolvedChannels = channels || (await defaultChannelsFor(user, role));
  const now = new Date();

  const delivery = { push: {}, email: {}, inApp: {} };

  if (resolvedChannels.push) {
    const hasDevice = await Device.exists({ user });
    delivery.push = hasDevice
      ? { delivered: true, deliveredAt: now }
      : { delivered: false, failed: true, failReason: "No registered device" };
  }
  if (resolvedChannels.email) {
    delivery.email = { delivered: true, deliveredAt: now };
  }
  if (resolvedChannels.inApp) {
    delivery.inApp = { delivered: true, deliveredAt: now };
  }

  return Notification.create({
    user,
    title,
    message,
    type,
    actionUrl,
    relatedLiveClass,
    relatedContent,
    channels: resolvedChannels,
    delivery,
  });
};
