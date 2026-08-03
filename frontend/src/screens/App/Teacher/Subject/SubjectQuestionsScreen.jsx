import { useMemo, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { QuestionAnswerOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import BigEmptyState from "../../../../components/Shared/BigEmptyState";
import DoubtThread from "../../../../components/Student/DoubtThread";
import { useT } from "../../../../i18n/LanguageContext";
import { useAuth } from "../../../../hooks/useAuth";
import { useGetSubjectQuery } from "../../../../store/services/subjectApi";
import { useGetSubjectDoubtsQuery } from "../../../../store/services/doubtApi";
import { useParams } from "react-router-dom";

/** Student questions for one subject, split into what still needs an answer. */
const SubjectQuestionsScreen = () => {
  const { id } = useParams();
  const t = useT();
  const { role } = useAuth();
  const isTeacher = role === "teacher";
  const base = isTeacher ? `/app/teacher/subjects/${id}` : `/app/admin/catalog/subjects/${id}`;

  const { data: subjectRes } = useGetSubjectQuery(id);
  const { data, isLoading, error } = useGetSubjectDoubtsQuery(id, { skip: !id });
  const [tab, setTab] = useState(0);

  const doubts = useMemo(() => data?.data ?? [], [data]);
  const waiting = useMemo(() => doubts.filter((d) => !d.isResolved), [doubts]);
  const answered = useMemo(() => doubts.filter((d) => d.isResolved), [doubts]);
  const shown = tab === 0 ? waiting : answered;

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        { title: t("nav.mySubjects"), path: isTeacher ? "/app/teacher/subjects" : "/app/admin/catalog/subjects" },
        { title: subjectRes?.data?.name || "…", path: base },
        { title: t("nav.questions") },
      ]}
      isBusy={isLoading}
    >
      <BreadcrumbLayout.Error error={error} />

      {doubts.length === 0 && !isLoading ? (
        <BigEmptyState
          icon={<QuestionAnswerOutlined />}
          title={t("questions.none")}
          body={t("subject.questionsDesc")}
          tone="success"
        />
      ) : (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={`${t("questions.waiting")} (${waiting.length})`} />
            <Tab label={`${t("questions.answered")} (${answered.length})`} />
          </Tabs>

          <BreadcrumbLayout.Paper sx={{ p: 2.5, mt: 2 }}>
            {shown.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: "center", py: 3 }}>
                {tab === 0 ? t("questions.allAnswered") : t("questions.none")}
              </Typography>
            ) : (
              <DoubtThread doubts={shown} canResolve emptyText={t("questions.none")} />
            )}
          </BreadcrumbLayout.Paper>
        </>
      )}

      <Box sx={{ mt: 2 }} />
    </BreadcrumbLayout>
  );
};

export default SubjectQuestionsScreen;
