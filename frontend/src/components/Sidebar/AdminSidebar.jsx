import {
  DashboardOutlined,
  SchoolOutlined,
  MenuBookOutlined,
  LocalOfferOutlined,
  VideocamOutlined,
  VisibilityOutlined,
  HistoryOutlined,
  PaidOutlined,
} from "@mui/icons-material";

import SidebarMenu from "./SidebarMenu";

const ADMIN_MENU = [
  { title: "Dashboard", path: "/app/admin", icon: <DashboardOutlined /> },
  { title: "Teachers", path: "/app/admin/teachers", icon: <SchoolOutlined /> },
  { title: "Programs", path: "/app/admin/catalog/programs", icon: <MenuBookOutlined /> },
  { title: "Years", path: "/app/admin/catalog/years", icon: <MenuBookOutlined /> },
  { title: "Subjects", path: "/app/admin/catalog/subjects", icon: <MenuBookOutlined /> },
  { title: "Coupons", path: "/app/admin/coupons", icon: <LocalOfferOutlined /> },
  { title: "Live Classes", path: "/app/admin/live-classes", icon: <VideocamOutlined /> },
  { title: "Monitor: Users", path: "/app/admin/monitor/users", icon: <VisibilityOutlined /> },
  { title: "Monitor: Content", path: "/app/admin/monitor/content", icon: <VisibilityOutlined /> },
  { title: "Activity Log", path: "/app/admin/activity-log", icon: <HistoryOutlined /> },
  { title: "Payouts", path: "/app/admin/payouts", icon: <PaidOutlined /> },
];

const AdminSidebar = () => <SidebarMenu menu={ADMIN_MENU} />;

export default AdminSidebar;
