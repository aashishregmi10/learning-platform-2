import {
  DashboardOutlined,
  MenuBookOutlined,
  VideocamOutlined,
} from "@mui/icons-material";

import SidebarMenu from "./SidebarMenu";

const TEACHER_MENU = [
  { title: "Dashboard", path: "/app/teacher", icon: <DashboardOutlined /> },
  { title: "My Subjects", path: "/app/teacher/subjects", icon: <MenuBookOutlined /> },
  { title: "Live Classes", path: "/app/teacher/live-classes", icon: <VideocamOutlined /> },
];

const TeacherSidebar = () => <SidebarMenu menu={TEACHER_MENU} />;

export default TeacherSidebar;
