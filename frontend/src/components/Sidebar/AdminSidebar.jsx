import {
  DashboardOutlined,
  SchoolOutlined,
  CalendarMonthOutlined,
  MenuBookOutlined,
  PeopleAltOutlined,
  LocalOfferOutlined,
  VideocamOutlined,
  VisibilityOutlined,
  HistoryOutlined,
  PaidOutlined,
} from "@mui/icons-material";

import SidebarMenu from "./SidebarMenu";
import { statusTokens } from "../../theme";

const c = {
  info: statusTokens.info.solid,
  success: statusTokens.success.solid,
  warning: statusTokens.warning.solid,
  danger: statusTokens.danger.solid,
  neutral: statusTokens.neutral.solid,
};

// Ordered to follow the setup flow: a program, then its years, then the
// subjects inside a year, and only then the teachers you assign to them.
// The catalogue chain shares one colour so it reads as a single sequence.
const ADMIN_MENU = [
  { title: "Dashboard", path: "/app/admin", icon: <DashboardOutlined />, end: true, color: c.info },
  { title: "Programs", path: "/app/admin/catalog/programs", icon: <SchoolOutlined />, color: c.info },
  { title: "Years", path: "/app/admin/catalog/years", icon: <CalendarMonthOutlined />, color: c.info },
  { title: "Subjects", path: "/app/admin/catalog/subjects", icon: <MenuBookOutlined />, color: c.info },
  { title: "Teachers", path: "/app/admin/teachers", icon: <PeopleAltOutlined />, color: c.success },
  { title: "Coupons", path: "/app/admin/coupons", icon: <LocalOfferOutlined />, color: c.warning },
  { title: "Live Classes", path: "/app/admin/live-classes", icon: <VideocamOutlined />, color: c.danger },
  { title: "Monitor: Users", path: "/app/admin/monitor/users", icon: <VisibilityOutlined />, color: c.neutral },
  { title: "Monitor: Content", path: "/app/admin/monitor/content", icon: <VisibilityOutlined />, color: c.neutral },
  { title: "Activity Log", path: "/app/admin/activity-log", icon: <HistoryOutlined />, color: c.neutral },
  { title: "Payouts", path: "/app/admin/payouts", icon: <PaidOutlined />, color: c.success },
];

const AdminSidebar = () => <SidebarMenu menu={ADMIN_MENU} />;

export default AdminSidebar;
