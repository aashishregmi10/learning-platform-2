import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { AddOutlined, MenuBookOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import BigEmptyState from "../../../../components/Shared/BigEmptyState";
import ChapterCard from "../../../../components/Teacher/ChapterCard";
import AddChapterDialog from "../../../../components/Teacher/AddChapterDialog";
import { useT } from "../../../../i18n/LanguageContext";
import { tokens } from "../../../../theme";
import { useAuth } from "../../../../hooks/useAuth";
import { useGetSubjectQuery } from "../../../../store/services/subjectApi";
import { useGetChaptersQuery } from "../../../../store/services/chapterApi";

/**
 * Chapters and their lessons — one job, one screen.
 *
 * Only the first chapter opens by default; the rest stay collapsed so the page
 * reads as a short list rather than a wall of every lesson at once.
 */
const LessonsScreen = () => {
  const { id } = useParams();
  const t = useT();
  const { role } = useAuth();
  const isTeacher = role === "teacher";
  const base = isTeacher ? `/app/teacher/subjects/${id}` : `/app/admin/catalog/subjects/${id}`;

  const { data: subjectRes, isLoading } = useGetSubjectQuery(id);
  const { data: chaptersRes, isFetching } = useGetChaptersQuery({ subject: id });
  const [adding, setAdding] = useState(false);

  const subject = subjectRes?.data;
  const chapters = chaptersRes?.data ?? [];
  const nextNumber = chapters.reduce((max, c) => Math.max(max, c.chapterNumber || 0), 0) + 1;

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        { title: t("nav.mySubjects"), path: isTeacher ? "/app/teacher/subjects" : "/app/admin/catalog/subjects" },
        { title: subject?.name || "…", path: base },
        { title: t("subject.lessons") },
      ]}
      isBusy={isLoading || isFetching}
      headerActions={
        chapters.length > 0 && (
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setAdding(true)}>
            {t("chapter.add")}
          </Button>
        )
      }
    >
      {chapters.length === 0 && !isFetching ? (
        <BigEmptyState
          icon={<MenuBookOutlined />}
          title={t("chapter.emptyTitle")}
          body={t("chapter.emptyBody")}
          actionLabel={t("chapter.addFirst")}
          onAction={() => setAdding(true)}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {chapters.map((ch, i) => (
            <ChapterCard key={ch._id} chapter={ch} subjectId={id} defaultOpen={i === 0} />
          ))}

          <Button
            onClick={() => setAdding(true)}
            startIcon={<AddOutlined />}
            sx={{
              py: 2,
              border: `2px dashed ${tokens.borderStrong}`,
              borderRadius: 3,
              color: tokens.muted,
              "&:hover": { borderColor: "var(--primary)", color: "var(--primary)" },
            }}
          >
            {t("chapter.add")}
          </Button>
        </Box>
      )}

      <Typography variant="caption" sx={{ display: "block", mt: 2, color: tokens.muted }}>
        <Link to={base} style={{ color: "var(--primary)" }}>
          ← {t("subject.backToSubjects")}
        </Link>
      </Typography>

      <AddChapterDialog
        open={adding}
        onClose={() => setAdding(false)}
        subjectId={id}
        nextNumber={nextNumber}
      />
    </BreadcrumbLayout>
  );
};

export default LessonsScreen;
