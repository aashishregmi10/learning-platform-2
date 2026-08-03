import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  FormControlLabel,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useT } from "../../../../i18n/LanguageContext";
import { tokens } from "../../../../theme";
import { useAuth } from "../../../../hooks/useAuth";
import { useGetSubjectQuery } from "../../../../store/services/subjectApi";
import {
  useGetChaptersQuery,
  useGetChapterQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
} from "../../../../store/services/chapterApi";

/**
 * Create or rename a chapter, on its own page — same shape as the admin
 * Program/Year/Subject forms so the whole app has one way of editing things.
 *
 * The chapter number is derived from what already exists rather than typed:
 * teachers add chapters in order, and asking for a number only invites clashes.
 */
const ChapterFormScreen = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const { role } = useAuth();
  const isEdit = !!chapterId;
  const isTeacher = role === "teacher";
  const base = isTeacher ? `/app/teacher/subjects/${id}` : `/app/admin/catalog/subjects/${id}`;

  const { data: subjectRes } = useGetSubjectQuery(id);
  const { data: chaptersRes } = useGetChaptersQuery({ subject: id });
  const { data: chapterRes, isFetching: loadingChapter } = useGetChapterQuery(chapterId, {
    skip: !isEdit,
  });
  const [createChapter, { isLoading: creating }] = useCreateChapterMutation();
  const [updateChapter, { isLoading: updating }] = useUpdateChapterMutation();
  const busy = creating || updating;

  const subject = subjectRes?.data;
  const chapters = chaptersRes?.data ?? [];
  const nextNumber = chapters.reduce((max, c) => Math.max(max, c.chapterNumber || 0), 0) + 1;
  const chapter = chapterRes?.data;

  const [title, setTitle] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);

  useEffect(() => {
    if (!chapter) return;
    setTitle(chapter.title ?? "");
    setIsFreePreview(!!chapter.isFreePreview);
  }, [chapter]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateChapter({ id: chapterId, title: title.trim(), isFreePreview }).unwrap();
        toast.success(t("action.saved"));
        navigate(`${base}/chapters/${chapterId}`);
      } else {
        const res = await createChapter({
          subject: id,
          chapterNumber: nextNumber,
          title: title.trim(),
          isFreePreview,
        }).unwrap();
        toast.success(t("action.saved"));
        // Straight into the new chapter so the next step (adding topics) is obvious.
        navigate(`${base}/chapters/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        {
          title: t("nav.mySubjects"),
          path: isTeacher ? "/app/teacher/subjects" : "/app/admin/catalog/subjects",
        },
        { title: subject?.name || "…", path: base },
        { title: t("subject.lessons"), path: `${base}/lessons` },
        { title: isEdit ? t("chapter.rename") : t("chapter.add") },
      ]}
      isBusy={busy || loadingChapter}
    >
      <BreadcrumbLayout.Paper sx={{ p: { xs: 2.5, md: 4 } }}>
        <Box sx={{ maxWidth: 640 }}>
          <Typography variant="h5" sx={{ mb: 0.5 }}>
            {isEdit ? t("chapter.rename") : t("chapter.add")}
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.muted, mb: 3 }}>
            {isEdit ? subject?.name : `${t("chapter.one")} ${nextNumber} · ${subject?.name ?? ""}`}
          </Typography>

          {loadingChapter ? (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={80} />
            </Box>
          ) : (
            <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 3 }}>
              <TextField
                autoFocus
                required
                label={t("chapter.nameLabel")}
                placeholder={t("chapter.namePlaceholder")}
                helperText={t("chapter.nameHelp")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Box
                sx={{
                  border: `1px solid ${tokens.border}`,
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  bgcolor: tokens.surfaceMuted,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={isFreePreview}
                      onChange={(e) => setIsFreePreview(e.target.checked)}
                    />
                  }
                  label={t("chapter.freeLabel")}
                  slotProps={{ typography: { fontSize: "0.9rem" } }}
                />
                <Typography variant="caption" sx={{ display: "block", color: tokens.muted, pl: 6 }}>
                  {t("chapter.freeHelp")}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                <Button onClick={() => navigate(-1)} disabled={busy}>
                  {t("action.cancel")}
                </Button>
                <Button type="submit" variant="contained" disabled={busy || !title.trim()}>
                  {t("action.save")}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default ChapterFormScreen;
