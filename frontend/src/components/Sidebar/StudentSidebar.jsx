import {
  HomeOutlined,
  CardMembershipOutlined,
  ReceiptLongOutlined,
  VideocamOutlined,
} from "@mui/icons-material";

import SidebarMenu from "./SidebarMenu";

/**
 * Student nav is deliberately colourless.
 *
 * On the staff side a colour per item helps scan a long menu. Here the student
 * is trying to read a lesson — four brightly coloured icons beside the content
 * just compete with it. Everything stays neutral grey and only the active item
 * takes the accent.
 */
const STUDENT_MENU = [
  { title: "Catalog", path: "/app/student", icon: <HomeOutlined />, end: true },
  {
    title: "My Subscriptions",
    path: "/app/student/subscriptions",
    icon: <CardMembershipOutlined />,
  },
  { title: "Orders", path: "/app/student/orders", icon: <ReceiptLongOutlined /> },
  { title: "Live Classes", path: "/app/student/live-classes", icon: <VideocamOutlined /> },
];

const StudentSidebar = () => <SidebarMenu menu={STUDENT_MENU} />;

export default StudentSidebar;
