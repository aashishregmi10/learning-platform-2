import { Divider } from "@mui/material";

import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import UpcomingClasses from "../../../components/Student/UpcomingClasses";
import DeviceManager from "../../../components/Student/DeviceManager";
import PageHeader from "../../../components/Student/PageHeader";
import { useDeviceSession } from "../../../hooks/useDeviceSession";

const LiveClassesScreen = () => {
  useDeviceSession(true);

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Live Classes" }]}>
      <div style={{ width: "100%" }}>
        <PageHeader eyebrow="Schedule" title="Live Classes" subtitle="Join scheduled sessions with your subject teachers." />
        <UpcomingClasses />
        <Divider sx={{ my: 4 }} />
        <DeviceManager />
      </div>
    </BreadcrumbLayout>
  );
};

export default LiveClassesScreen;
