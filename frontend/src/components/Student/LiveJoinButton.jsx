import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { useLazyJoinLiveClassQuery, useAttendanceHeartbeatMutation } from "../../store/services/liveClassApi";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

// Mints a join token only when entitled, opens the meeting, then accrues
// attendance via periodic heartbeats for as long as this button stays mounted.
const LiveJoinButton = ({ liveClass }) => {
  const [triggerJoin, { isFetching }] = useLazyJoinLiveClassQuery();
  const [heartbeat] = useAttendanceHeartbeatMutation();
  const [inSession, setInSession] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const join = async () => {
    try {
      const res = await triggerJoin(liveClass._id).unwrap();
      window.open(res.data.joinUrl, "_blank");
      setInSession(true);
      heartbeat(liveClass._id);
      intervalRef.current = setInterval(() => heartbeat(liveClass._id), HEARTBEAT_INTERVAL_MS);
    } catch (err) {
      toast.error(err?.data?.message || "Could not join");
    }
  };

  const leave = () => {
    clearInterval(intervalRef.current);
    setInSession(false);
  };

  if (inSession) {
    return (
      <button
        onClick={leave}
        style={{ background: "transparent", color: "#8C7B6B", border: "1px solid #E7E0D4", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
      >
        In class — leave
      </button>
    );
  }

  return (
    <button
      onClick={join}
      disabled={isFetching}
      style={{ background: "#2D5A3D", color: "#fff", border: 0, borderRadius: 6, padding: "6px 14px", cursor: isFetching ? "default" : "pointer", fontWeight: 600 }}
    >
      {isFetching ? "Joining…" : "Join"}
    </button>
  );
};

export default LiveJoinButton;
