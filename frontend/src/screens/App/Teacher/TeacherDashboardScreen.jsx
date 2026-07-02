import { Typography } from "@mui/material";

import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";

const TeacherDashboardScreen = () => (
  <BreadcrumbLayout breadcrumbs={[{ title: "Dashboard" }]}>
    <BreadcrumbLayout.Paper>
      <div style={{ padding: 24 }}>
        <Typography variant="h6">Teacher Dashboard</Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Authoring subjects & live classes arrives in Parts 2 and 5.
        </Typography>
      </div>
    </BreadcrumbLayout.Paper>
  </BreadcrumbLayout>
);

export default TeacherDashboardScreen;
