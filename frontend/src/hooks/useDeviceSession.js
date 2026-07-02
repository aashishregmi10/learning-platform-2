import { useEffect } from "react";
import { toast } from "react-toastify";

import { useSessionHeartbeatMutation } from "../store/services/sessionApi";

const DEVICE_ID_KEY = "deviceId";
const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000; // well inside the 6h session TTL

const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

// Registers this browser as an active device for the logged-in student and
// keeps it alive. A 409 means the concurrent-device cap was hit — never
// auto-kicks another device, just surfaces it so the student can free a slot.
export const useDeviceSession = (enabled) => {
  const [heartbeat] = useSessionHeartbeatMutation();

  useEffect(() => {
    if (!enabled) return;
    const deviceId = getDeviceId();

    const ping = async () => {
      try {
        await heartbeat({ deviceId, deviceType: "web" }).unwrap();
      } catch (err) {
        if (err?.status === 409) {
          toast.warn(err?.data?.message || "Device limit reached — manage your devices to continue.");
        }
      }
    };

    ping();
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return getDeviceId;
};
