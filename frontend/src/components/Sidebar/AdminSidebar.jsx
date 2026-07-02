import {
  DashboardOutlined,
  SchoolOutlined,
  MenuBookOutlined,
  LocalOfferOutlined,
} from "@mui/icons-material";

import SidebarMenu from "./SidebarMenu";

const ADMIN_MENU = [
  { title: "Dashboard", path: "/app/admin", icon: <DashboardOutlined /> },
  { title: "Teachers", path: "/app/admin/teachers", icon: <SchoolOutlined /> },
  { title: "Programs", path: "/app/admin/catalog/programs", icon: <MenuBookOutlined /> },
  { title: "Years", path: "/app/admin/catalog/years", icon: <MenuBookOutlined /> },
  { title: "Subjects", path: "/app/admin/catalog/subjects", icon: <MenuBookOutlined /> },
  { title: "Coupons", path: "/app/admin/coupons", icon: <LocalOfferOutlined /> },
];

const AdminSidebar = () => <SidebarMenu menu={ADMIN_MENU} />;

export default AdminSidebar;
