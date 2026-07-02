import {
  HomeOutlined,
  CardMembershipOutlined,
  ReceiptLongOutlined,
  WorkspacePremiumOutlined,
  VideocamOutlined,
} from "@mui/icons-material";

import SidebarMenu from "./SidebarMenu";

const STUDENT_MENU = [
  { title: "Catalog", path: "/app/student", icon: <HomeOutlined /> },
  { title: "My Subscriptions", path: "/app/student/subscriptions", icon: <CardMembershipOutlined /> },
  { title: "Orders", path: "/app/student/orders", icon: <ReceiptLongOutlined /> },
  { title: "Certificates", path: "/app/student/certificates", icon: <WorkspacePremiumOutlined /> },
  { title: "Live Classes", path: "/app/student/live-classes", icon: <VideocamOutlined /> },
];

const StudentSidebar = () => <SidebarMenu menu={STUDENT_MENU} />;

export default StudentSidebar;
