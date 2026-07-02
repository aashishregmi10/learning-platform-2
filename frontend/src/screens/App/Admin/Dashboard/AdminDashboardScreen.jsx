import { Box, Paper, Typography } from "@mui/material";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useGetAdminDashboardQuery } from "../../../../store/services/adminApi";

const COLORS = ["#1976d3", "#2D5A3D", "#f0a500", "#b3261e"];

const MetricCard = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 2, textAlign: "center", flex: "1 1 160px" }}>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
    <Typography variant="body2" sx={{ color: "#6b7280" }}>{label}</Typography>
  </Paper>
);

const AdminDashboardScreen = () => {
  const { data, isLoading, error } = useGetAdminDashboardQuery();
  const d = data?.data;

  const userPie = d ? [
    { name: "Students", value: d.users.students },
    { name: "Teachers", value: d.users.teachers },
  ] : [];

  const catalogBar = d ? [
    { name: "Programs", value: d.catalog.programs },
    { name: "Subjects", value: d.catalog.subjects },
    { name: "Published contents", value: d.catalog.publishedContents },
  ] : [];

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Dashboard" }]} isBusy={isLoading}>
      <BreadcrumbLayout.Error error={error} />
      {d && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <MetricCard label="Students" value={d.users.students} />
            <MetricCard label="Teachers" value={d.users.teachers} />
            <MetricCard label="Active (7d)" value={d.users.active7d} />
            <MetricCard label="Subjects" value={d.catalog.subjects} />
            <MetricCard label="Published content" value={d.catalog.publishedContents} />
            <MetricCard label="Upcoming live classes" value={d.live.upcoming} />
            <MetricCard label="Revenue (NPR)" value={d.commerce.revenueNPR.toLocaleString()} />
            <MetricCard label="Paid orders" value={d.commerce.ordersPaid} />
            <MetricCard label="Active subscriptions" value={d.commerce.activeSubscriptions} />
            <MetricCard label="Avg. attendance (30d, min)" value={d.live.last30dAttendanceAvg} />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, flex: "1 1 340px" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Users</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={userPie} dataKey="value" nameKey="name" outerRadius={80} label>
                    {userPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: "2 1 420px" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Catalog</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catalogBar}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2D5A3D" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>
      )}
    </BreadcrumbLayout>
  );
};

export default AdminDashboardScreen;
