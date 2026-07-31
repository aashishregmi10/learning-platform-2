import { Box, Paper, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CampaignOutlined,
  GroupsOutlined,
  MenuBookOutlined,
  PaidOutlined,
  ReceiptLongOutlined,
  SchoolOutlined,
  TimerOutlined,
  TrendingUpOutlined,
  VideocamOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { statusTokens, tokens } from "../../../../theme";
import { useGetAdminDashboardQuery } from "../../../../store/services/adminApi";

// Chart series cycle the role solids so bars and slices read apart at a glance.
const CHART_COLORS = [
  statusTokens.info.solid,
  statusTokens.success.solid,
  statusTokens.warning.solid,
  statusTokens.danger.solid,
];

/**
 * Tinted metric tile. `tone` picks the role: info for descriptive counts,
 * success/warning/danger where the number itself is a verdict (revenue at
 * zero, no live subscriptions).
 */
const MetricCard = ({ label, value, tone = "info", icon }) => {
  const t = statusTokens[tone] ?? statusTokens.info;
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        flex: "1 1 170px",
        borderRadius: 2.5,
        bgcolor: t.bg,
        borderColor: "transparent",
        position: "relative",
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          insetInline: 0,
          top: 0,
          height: 3,
          bgcolor: t.solid,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: t.fg }}>
          {value}
        </Typography>
        {icon && <Box sx={{ color: t.solid, display: "flex", "& svg": { fontSize: 22 } }}>{icon}</Box>}
      </Box>
      <Typography variant="body2" sx={{ color: t.fg, opacity: 0.85, mt: 0.25 }}>
        {label}
      </Typography>
    </Paper>
  );
};

const ChartCard = ({ title, children, flex }) => (
  <Paper variant="outlined" sx={{ p: 2, flex, borderRadius: 2.5 }}>
    <Typography variant="subtitle2" sx={{ mb: 1.5, color: tokens.ink }}>
      {title}
    </Typography>
    {children}
  </Paper>
);

const AdminDashboardScreen = () => {
  const { data, isLoading, error } = useGetAdminDashboardQuery();
  const d = data?.data;

  const userPie = d
    ? [
        { name: "Students", value: d.users.students },
        { name: "Teachers", value: d.users.teachers },
      ]
    : [];

  const catalogBar = d
    ? [
        { name: "Programs", value: d.catalog.programs },
        { name: "Subjects", value: d.catalog.subjects },
        { name: "Published contents", value: d.catalog.publishedContents },
      ]
    : [];

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Dashboard" }]} isBusy={isLoading}>
      <BreadcrumbLayout.Error error={error} />
      {d && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <MetricCard label="Students" value={d.users.students} icon={<GroupsOutlined />} />
            <MetricCard
              label="Teachers"
              value={d.users.teachers}
              tone="success"
              icon={<SchoolOutlined />}
            />
            <MetricCard
              label="Active (7d)"
              value={d.users.active7d}
              tone={d.users.active7d > 0 ? "success" : "warning"}
              icon={<TrendingUpOutlined />}
            />
            <MetricCard
              label="Subjects"
              value={d.catalog.subjects}
              icon={<MenuBookOutlined />}
            />
            <MetricCard
              label="Published content"
              value={d.catalog.publishedContents}
              tone="success"
              icon={<WorkspacePremiumOutlined />}
            />
            <MetricCard
              label="Upcoming live classes"
              value={d.live.upcoming}
              tone="warning"
              icon={<VideocamOutlined />}
            />
            {/* Revenue and subscriptions are verdicts — red when they're zero. */}
            <MetricCard
              label="Revenue (NPR)"
              value={d.commerce.revenueNPR.toLocaleString()}
              tone={d.commerce.revenueNPR > 0 ? "success" : "danger"}
              icon={<PaidOutlined />}
            />
            <MetricCard
              label="Paid orders"
              value={d.commerce.ordersPaid}
              tone={d.commerce.ordersPaid > 0 ? "success" : "warning"}
              icon={<ReceiptLongOutlined />}
            />
            <MetricCard
              label="Active subscriptions"
              value={d.commerce.activeSubscriptions}
              tone={d.commerce.activeSubscriptions > 0 ? "success" : "danger"}
              icon={<CampaignOutlined />}
            />
            <MetricCard
              label="Avg. attendance (30d, min)"
              value={d.live.last30dAttendanceAvg}
              icon={<TimerOutlined />}
            />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <ChartCard title="Users" flex="1 1 340px">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={userPie} dataKey="value" nameKey="name" outerRadius={80} label>
                    {userPie.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Catalog" flex="2 1 420px">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catalogBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tokens.border} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: tokens.muted }}
                    axisLine={{ stroke: tokens.border }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: tokens.muted }}
                    axisLine={{ stroke: tokens.border }}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: statusTokens.info.bg }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {catalogBar.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Box>
        </Box>
      )}
    </BreadcrumbLayout>
  );
};

export default AdminDashboardScreen;
