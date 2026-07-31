import {
  HomeOutlined,
  CardMembershipOutlined,
  ReceiptLongOutlined,
  WorkspacePremiumOutlined,
  VideocamOutlined,
} from "@mui/icons-material";

import SidebarMenu from "./SidebarMenu";
import { statusTokens } from "../../theme";

const STUDENT_MENU = [
  {
    title: "Catalog",
    path: "/app/student",
    icon: <HomeOutlined />,
    end: true,
    color: statusTokens.info.solid,
  },
  {
    title: "My Subscriptions",
    path: "/app/student/subscriptions",
    icon: <CardMembershipOutlined />,
    color: statusTokens.success.solid,
  },
  {
    title: "Orders",
    path: "/app/student/orders",
    icon: <ReceiptLongOutlined />,
    color: statusTokens.warning.solid,
  },
  {
    title: "Certificates",
    path: "/app/student/certificates",
    icon: <WorkspacePremiumOutlined />,
    color: statusTokens.success.solid,
  },
  {
    title: "Live Classes",
    path: "/app/student/live-classes",
    icon: <VideocamOutlined />,
    color: statusTokens.danger.solid,
  },
];

const StudentSidebar = () => <SidebarMenu menu={STUDENT_MENU} />;

export default StudentSidebar;
