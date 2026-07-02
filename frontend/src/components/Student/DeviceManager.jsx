import { toast } from "react-toastify";
import { DevicesOutlined } from "@mui/icons-material";

import { useGetMySessionsQuery, useDeleteSessionMutation } from "../../store/services/sessionApi";

const DeviceManager = () => {
  const { data, isLoading } = useGetMySessionsQuery();
  const [deleteSession] = useDeleteSessionMutation();
  const devices = data?.data ?? [];
  const thisDeviceId = localStorage.getItem("deviceId");

  const kick = async (deviceId) => {
    try {
      await deleteSession(deviceId).unwrap();
      toast.success("Device signed out");
    } catch {
      toast.error("Could not sign out that device");
    }
  };

  if (isLoading) return null;
  if (devices.length === 0) return null;

  return (
    <div>
      <h3 style={{ fontSize: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <DevicesOutlined fontSize="small" sx={{ color: "var(--student-ink)" }} /> Signed-in devices
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {devices.map((d) => (
          <div
            key={d.deviceId}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px",
              border: "1px solid var(--border)", borderRadius: 10, background: "#fff",
            }}
          >
            <span style={{ fontSize: 14 }}>
              {d.deviceType || "web"} {d.deviceId === thisDeviceId && <em style={{ color: "var(--muted)" }}>(this device)</em>}
              <br />
              <span style={{ color: "var(--muted)", fontSize: 12 }}>last active {new Date(d.lastSeenAt).toLocaleString()}</span>
            </span>
            <button
              onClick={() => kick(d.deviceId)}
              style={{ background: "transparent", color: "#b3261e", border: "1px solid #b3261e", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              Sign out
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceManager;
