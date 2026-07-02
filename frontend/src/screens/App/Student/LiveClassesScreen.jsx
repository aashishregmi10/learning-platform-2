import UpcomingClasses from "../../../components/Student/UpcomingClasses";
import DeviceManager from "../../../components/Student/DeviceManager";
import { useDeviceSession } from "../../../hooks/useDeviceSession";

const LiveClassesScreen = () => {
  useDeviceSession(true);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ color: "#1976d3" }}>Live Classes</h1>
        <UpcomingClasses />
      </div>
      <DeviceManager />
    </div>
  );
};

export default LiveClassesScreen;
