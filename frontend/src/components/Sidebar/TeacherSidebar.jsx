import {
  DashboardOutlined,
  MenuBookOutlined,
  VideocamOutlined,
  QuizOutlined,
  QuestionAnswerOutlined,
} from "@mui/icons-material";

import SidebarMenu from "./SidebarMenu";
import { useT } from "../../i18n/LanguageContext";
import { statusTokens } from "../../theme";
import { useGetSubjectsQuery } from "../../store/services/subjectApi";
import { useGetMyDoubtsQuery } from "../../store/services/doubtApi";

// The teacher's assigned subjects sit under "My Subjects" so they're one click
// away — same-named subjects are told apart by the year label on the right.
const SUBJECT_QUERY_ARGS = { limit: 50 };

const TeacherSidebar = () => {
  const t = useT();
  const { data } = useGetSubjectsQuery(SUBJECT_QUERY_ARGS);
  const { data: doubtsRes } = useGetMyDoubtsQuery();
  const subjects = data?.data ?? [];
  const unresolved = doubtsRes?.unresolvedCount ?? 0;

  const menu = [
    {
      title: t("nav.dashboard"),
      path: "/app/teacher",
      icon: <DashboardOutlined />,
      end: true,
      color: statusTokens.info.solid,
    },
    {
      title: t("nav.mySubjects"),
      path: "/app/teacher/subjects",
      icon: <MenuBookOutlined />,
      color: statusTokens.info.solid,
      children: [
        { title: t("nav.allSubjects"), path: "/app/teacher/subjects", end: true },
        ...subjects.map((s) => ({
          title: s.name,
          path: `/app/teacher/subjects/${s._id}`,
          meta: s.year?.yearName,
          // Published subjects read green, drafts amber — same roles as the badges.
          dot: s.isActive ? statusTokens.success.solid : statusTokens.warning.solid,
        })),
      ],
    },
    {
      title: t("nav.quizzes"),
      path: "/app/teacher/quizzes",
      icon: <QuizOutlined />,
      color: statusTokens.warning.solid,
    },
    {
      title: t("nav.liveClasses"),
      path: "/app/teacher/live-classes",
      icon: <VideocamOutlined />,
      color: statusTokens.danger.solid,
    },
    {
      title: t("nav.questions"),
      path: "/app/teacher/doubts",
      icon: <QuestionAnswerOutlined />,
      color: statusTokens.success.solid,
      badge: unresolved || undefined,
    },
  ];

  return <SidebarMenu menu={menu} />;
};

export default TeacherSidebar;
