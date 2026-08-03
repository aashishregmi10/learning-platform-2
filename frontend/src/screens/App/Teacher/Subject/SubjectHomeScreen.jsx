import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Paper, Typography } from "@mui/material";
import {
  ChevronRightOutlined,
  MenuBookOutlined,
  QuizOutlined,
  QuestionAnswerOutlined,
  VideocamOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useT } from "../../../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../../../theme";
import { useAuth } from "../../../../hooks/useAuth";
import {
  useGetSubjectQuery,
  useUpdateSubjectMutation,
} from "../../../../store/services/subjectApi";
import { useGetChaptersQuery } from "../../../../store/services/chapterApi";
import { useListQuizzesQuery } from "../../../../store/services/quizApi";
import { useListLiveClassesQuery } from "../../../../store/services/liveClassApi";
import { useGetSubjectDoubtsQuery } from "../../../../store/services/doubtApi";

/**
 * The subject's front door: four big destinations instead of a dense tab bar.
 *
 * Teachers told us the tabbed page showed everything at once with no obvious
 * starting point. This reads as a menu — pick the one job you came to do —
 * and each card carries a live count so the state of the subject is legible
 * without opening anything.
 */
const MenuCard = ({ icon: Icon, tone, title, desc, count, countLabel, onClick, urgent }) => {
  const t = statusTokens[tone];
  return (
    <Paper
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      sx={{
        borderRadius: 3,
        p: 3,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        transition: "border-color .15s, background-color .15s",
        "&:hover": { borderColor: t.solid, bgcolor: t.bg },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 2.5,
          bgcolor: t.bg,
          color: t.solid,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: tokens.muted, mt: 0.25, lineHeight: 1.5 }}>
          {desc}
        </Typography>
        {count !== undefined && (
          <Typography
            variant="caption"
            sx={{
              display: "inline-block",
              mt: 1,
              px: 1,
              py: 0.25,
              borderRadius: 1.5,
              fontWeight: 700,
              bgcolor: urgent ? statusTokens.danger.bg : t.bg,
              color: urgent ? statusTokens.danger.fg : t.fg,
            }}
          >
            {count} {countLabel}
          </Typography>
        )}
      </Box>

      <ChevronRightOutlined sx={{ color: tokens.faint, flexShrink: 0 }} />
    </Paper>
  );
};

const SubjectHomeScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const { role } = useAuth();
  const isTeacher = role === "teacher";
  const base = isTeacher ? `/app/teacher/subjects/${id}` : `/app/admin/catalog/subjects/${id}`;

  const { data: subjectRes, isLoading, error } = useGetSubjectQuery(id);
  const { data: chaptersRes } = useGetChaptersQuery({ subject: id });
  const { data: quizzesRes } = useListQuizzesQuery({ subject: id });
  const { data: liveRes } = useListLiveClassesQuery({ subject: id });
  const { data: doubtsRes } = useGetSubjectDoubtsQuery(id, { skip: !id });
  const [updateSubject, { isLoading: saving }] = useUpdateSubjectMutation();

  const subject = subjectRes?.data;
  const chapters = chaptersRes?.data ?? [];
  const quizzes = quizzesRes?.data ?? [];
  const liveClasses = liveRes?.data ?? [];
  const openQuestions = (doubtsRes?.data ?? []).filter((d) => !d.isResolved).length;

  const visible = !!subject?.isActive;

  const toggleVisible = async () => {
    try {
      await updateSubject({ id, isActive: !visible }).unwrap();
      toast.success(t("action.saved"));
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        { title: t("nav.mySubjects"), path: isTeacher ? "/app/teacher/subjects" : "/app/admin/catalog/subjects" },
        { title: subject ? `${subject.name}${subject.year?.yearName ? ` — ${subject.year.yearName}` : ""}` : "…" },
      ]}
      isBusy={isLoading || saving}
    >
      <BreadcrumbLayout.Error error={error} />

      {/* Visibility, stated as a sentence rather than a "Draft" chip */}
      {subject && (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            bgcolor: visible ? statusTokens.success.bg : statusTokens.warning.bg,
            borderColor: "transparent",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {visible ? (
              <VisibilityOutlined sx={{ color: statusTokens.success.solid }} />
            ) : (
              <VisibilityOffOutlined sx={{ color: statusTokens.warning.solid }} />
            )}
            <Typography
              sx={{
                fontWeight: 700,
                color: visible ? statusTokens.success.fg : statusTokens.warning.fg,
              }}
            >
              {visible ? t("subject.visibleToStudents") : t("subject.hiddenFromStudents")}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={toggleVisible} disabled={saving}>
            {visible ? t("subject.hideFromStudents") : t("subject.showToStudents")}
          </Button>
        </Paper>
      )}

      <Typography variant="h6" sx={{ mt: 1 }}>
        {t("subject.whatToDo")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
        }}
      >
        <MenuCard
          icon={MenuBookOutlined}
          tone="info"
          title={t("subject.lessons")}
          desc={t("subject.lessonsDesc")}
          count={chapters.length}
          countLabel={t("chapter.count")}
          onClick={() => navigate(`${base}/lessons`)}
        />
        <MenuCard
          icon={QuizOutlined}
          tone="warning"
          title={t("nav.quizzes")}
          desc={t("subject.quizzesDesc")}
          count={quizzes.length}
          countLabel={t("nav.quizzes").toLowerCase()}
          onClick={() => navigate(`/app/${role}/quizzes?subject=${id}`)}
        />
        <MenuCard
          icon={QuestionAnswerOutlined}
          tone="success"
          title={t("nav.questions")}
          desc={t("subject.questionsDesc")}
          count={openQuestions}
          countLabel={t("questions.waiting").toLowerCase()}
          urgent={openQuestions > 0}
          onClick={() => navigate(`${base}/questions`)}
        />
        <MenuCard
          icon={VideocamOutlined}
          tone="danger"
          title={t("nav.liveClasses")}
          desc={t("subject.liveDesc")}
          count={liveClasses.length}
          countLabel={t("nav.liveClasses").toLowerCase()}
          onClick={() => navigate(`/app/${role}/live-classes?subject=${id}`)}
        />
      </Box>
    </BreadcrumbLayout>
  );
};

export default SubjectHomeScreen;
