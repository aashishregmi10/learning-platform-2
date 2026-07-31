import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import {
  ArrowForward,
  LayersOutlined,
  MenuBookOutlined,
  QuestionAnswerOutlined,
  VideocamOutlined,
} from "@mui/icons-material";

import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import StatusChip from "../../../components/Shared/StatusChip";
import { StatCard, StatCardRow } from "../../../components/Shared/StatCard";
import { tokens } from "../../../theme";
import { useAuth } from "../../../hooks/useAuth";
import { useGetSubjectsQuery } from "../../../store/services/subjectApi";
import { useGetMyDoubtsQuery } from "../../../store/services/doubtApi";
import { useListLiveClassesQuery } from "../../../store/services/liveClassApi";

const SUBJECT_QUERY_ARGS = { limit: 50 };

const TeacherDashboardScreen = () => {
  const { loggedInUser } = useAuth();
  const { data: subjectsRes, isLoading } = useGetSubjectsQuery(SUBJECT_QUERY_ARGS);
  const { data: doubtsRes } = useGetMyDoubtsQuery();
  const { data: liveRes } = useListLiveClassesQuery({ limit: 50 });

  const subjects = subjectsRes?.data ?? [];
  const liveClasses = liveRes?.data ?? [];
  const openQuestions = doubtsRes?.unresolvedCount ?? 0;
  const chapterCount = subjects.reduce((sum, s) => sum + (s.totalChapters ?? 0), 0);

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Dashboard" }]} isBusy={isLoading}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5">
          {loggedInUser?.name ? `Hello, ${loggedInUser.name.split(" ")[0]}` : "Hello"}
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.muted }}>
          {subjects.length === 0
            ? "No subjects assigned to you yet — an admin needs to assign some before you can author content."
            : `${subjects.length} subject${subjects.length === 1 ? "" : "s"} to look after${
                openQuestions ? `, and ${openQuestions} question${openQuestions === 1 ? "" : "s"} waiting on you.` : "."
              }`}
        </Typography>
      </Box>

      <StatCardRow>
        <StatCard value={subjects.length} label="Subjects" tone="info" icon={<MenuBookOutlined />} />
        <StatCard value={chapterCount} label="Chapters" tone="success" icon={<LayersOutlined />} />
        <StatCard
          value={liveClasses.length}
          label="Live sessions"
          tone="warning"
          icon={<VideocamOutlined />}
        />
        {/* The one number that's a verdict: red while anything is unanswered. */}
        <StatCard
          value={openQuestions}
          label="Open questions"
          tone={openQuestions > 0 ? "danger" : "success"}
          icon={<QuestionAnswerOutlined />}
        />
      </StatCardRow>

      <Box
        sx={{
          mt: 3,
          mb: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">My subjects</Typography>
        <Button component={Link} to="/app/teacher/subjects" endIcon={<ArrowForward />}>
          See all
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
        }}
      >
        {subjects.slice(0, 6).map((s) => (
          <BreadcrumbLayout.Paper
            key={s._id}
            component={Link}
            to={`/app/teacher/subjects/${s._id}`}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              display: "block",
              textDecoration: "none",
              "&:hover": { borderColor: tokens.borderStrong, bgcolor: tokens.surfaceMuted },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ color: tokens.ink }}>
                {s.name}
              </Typography>
              <StatusChip active={s.isActive} />
            </Box>
            <Typography variant="caption">
              {s.year?.yearName ?? "—"} · {s.totalChapters ?? 0} chapter
              {(s.totalChapters ?? 0) === 1 ? "" : "s"}
            </Typography>
          </BreadcrumbLayout.Paper>
        ))}

        {subjects.length === 0 && !isLoading && (
          <BreadcrumbLayout.Paper sx={{ p: 4, gridColumn: "1 / -1" }}>
            <Typography variant="body2" sx={{ color: tokens.muted, textAlign: "center" }}>
              Nothing assigned yet — once an admin gives you a subject it shows up here.
            </Typography>
          </BreadcrumbLayout.Paper>
        )}
      </Box>
    </BreadcrumbLayout>
  );
};

export default TeacherDashboardScreen;
