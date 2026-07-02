import { Typography } from "@mui/material";

import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";

const AdminDashboardScreen = () => (
  <BreadcrumbLayout breadcrumbs={[{ title: "Dashboard" }]}>
    <BreadcrumbLayout.Paper>
      <div style={{ padding: 24 }}>
        <Typography variant="h6">Admin Dashboard</Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Monitoring metrics arrive in Part 6. For now, manage Teachers from the sidebar.
        </Typography>
      </div>
    </BreadcrumbLayout.Paper>
  </BreadcrumbLayout>
);

export default AdminDashboardScreen;
