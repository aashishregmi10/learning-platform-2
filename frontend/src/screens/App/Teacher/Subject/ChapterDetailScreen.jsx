import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import {
  AddOutlined,
  ArticleOutlined,
  DeleteOutlineOutlined,
  DriveFileRenameOutlineOutlined,
  EditOutlined,
  HeadphonesOutlined,
  LinkOutlined,
  OndemandVideoOutlined,
  PictureAsPdfOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import BigEmptyState from "../../../../components/Shared/BigEmptyState";
import ConfirmDialog from "../../../../components/Shared/ConfirmDialog";
import AddLessonDialog from "../../../../components/Teacher/AddLessonDialog";
import AddChapterDialog from "../../../../components/Teacher/AddChapterDialog";
import EditLessonDialog from "../../../../components/Teacher/EditLessonDialog";
import StudentPreview from "../../../../components/Teacher/StudentPreview";
import { useT } from "../../../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../../../theme";
import { useAuth } from "../../../../hooks/useAuth";
import { useGetSubjectQuery } from "../../../../store/services/subjectApi";
import {
  useGetChapterQuery,
  useUpdateChapterMutation,
} from "../../../../store/services/chapterApi";
import {
  useGetContentsQuery,
  useDeleteContentMutation,
} from "../../../../store/services/contentApi";

const KIND_ICON = {
  note: ArticleOutlined,
  pdf: PictureAsPdfOutlined,
  video: OndemandVideoOutlined,
  link: LinkOutlined,
  audio: HeadphonesOutlined,
};

const KIND_TONE = { note: "info", pdf: "danger", video: "success", link: "warning", audio: "neutral" };

/**
 * Level 2 of authoring: the topics inside one chapter.
 *
 * Full CRUD lives here and nowhere else — add (which asks what kind of content
 * it is), preview as a student, edit, delete. Keeping it on its own screen
 * means the chapter list stays a short scannable list, and a teacher working on
 * "Chapter 3" isn't distracted by every other chapter's contents.
 */
const ChapterDetailScreen = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const { role } = useAuth();
  const isTeacher = role === "teacher";
  const base = isTeacher ? `/app/teacher/subjects/${id}` : `/app/admin/catalog/subjects/${id}`;

  const { data: subjectRes } = useGetSubjectQuery(id);
  const { data: chapterRes, isLoading } = useGetChapterQuery(chapterId);
  const { data: contentsRes, isFetching } = useGetContentsQuery({ chapter: chapterId });
  const [updateChapter, { isLoading: toggling }] = useUpdateChapterMutation();
  const [deleteContent, { isLoading: deletingTopic }] = useDeleteContentMutation();

  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const subject = subjectRes?.data;
  const chapter = chapterRes?.data;
  const topics = contentsRes?.data ?? [];
  const visible = !!chapter?.isPublished;
  const tone = visible ? statusTokens.success : statusTokens.warning;

  const toggleVisibility = async () => {
    try {
      await updateChapter({ id: chapterId, isPublished: !visible }).unwrap();
      toast.success(t("action.saved"));
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  const removeTopic = async () => {
    try {
      await deleteContent(confirming._id).unwrap();
      setConfirming(null);
      toast.success(t("action.done"));
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
        { title: chapter ? `${t("chapter.one")} ${chapter.chapterNumber}` : "…" },
      ]}
      isBusy={isLoading || isFetching}
      headerActions={
        topics.length > 0 && (
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setAdding(true)}>
            {t("topic.add")}
          </Button>
        )
      }
    >
      {/* Chapter header — its own settings live here, separate from the topics */}
      {chapter && (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ flexGrow: 1, minWidth: 240 }}>
              <Typography variant="caption" sx={{ color: tokens.muted, fontWeight: 700, letterSpacing: "0.06em" }}>
                {t("chapter.one").toUpperCase()} {chapter.chapterNumber}
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5, mb: 1 }}>
                {chapter.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: tone.bg,
                    color: tone.fg,
                    borderRadius: 1.5,
                    px: 1,
                    py: 0.25,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {visible ? (
                    <VisibilityOutlined sx={{ fontSize: 13 }} />
                  ) : (
                    <VisibilityOffOutlined sx={{ fontSize: 13 }} />
                  )}
                  {visible ? t("visible.yes") : t("visible.no")}
                </Box>
                {chapter.isFreePreview && (
                  <Box
                    component="span"
                    sx={{
                      bgcolor: statusTokens.info.bg,
                      color: statusTokens.info.fg,
                      borderRadius: 1.5,
                      px: 1,
                      py: 0.25,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    {t("visible.free")}
                  </Box>
                )}
                <Typography variant="caption" sx={{ color: tokens.muted }}>
                  {topics.length} {t("topic.count")}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<DriveFileRenameOutlineOutlined />}
                onClick={() => setRenaming(true)}
              >
                {t("chapter.settings")}
              </Button>
              <Button
                variant="outlined"
                disabled={toggling}
                startIcon={visible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                onClick={toggleVisibility}
              >
                {visible ? t("visible.hide") : t("visible.show")}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Topics */}
      {topics.length === 0 && !isFetching ? (
        <BigEmptyState
          icon={<ArticleOutlined />}
          title={t("topic.emptyTitle")}
          body={t("topic.emptyBody")}
          actionLabel={t("topic.addFirst")}
          onAction={() => setAdding(true)}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {topics.map((topic, i) => {
            const Icon = KIND_ICON[topic.type] ?? ArticleOutlined;
            const topicTone = statusTokens[KIND_TONE[topic.type] ?? "neutral"];
            return (
              <Paper
                key={topic._id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 2,
                    bgcolor: topicTone.bg,
                    color: topicTone.solid,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 180 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    <Box component="span" sx={{ color: tokens.muted, mr: 0.75 }}>
                      {chapter?.chapterNumber}.{i + 1}
                    </Box>
                    {topic.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.25 }}>
                    <Typography variant="caption" sx={{ color: topicTone.fg, fontWeight: 700 }}>
                      {t(`kind.${topic.type}`)}
                    </Typography>
                    {topic.isFree && (
                      <Typography
                        variant="caption"
                        sx={{ color: statusTokens.success.fg, fontWeight: 700 }}
                      >
                        {t("visible.free")}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", flexShrink: 0 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityOutlined sx={{ fontSize: 16 }} />}
                    onClick={() => setPreviewing(topic)}
                  >
                    {t("preview.open")}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                    onClick={() => setEditing(topic)}
                  >
                    {t("action.edit")}
                  </Button>
                  <IconButton
                    size="small"
                    aria-label={`${t("lesson.delete")}: ${topic.title}`}
                    onClick={() => setConfirming(topic)}
                    sx={{ color: statusTokens.danger.solid }}
                  >
                    <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Paper>
            );
          })}

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
            {t("topic.add")}
          </Button>
        </Box>
      )}

      <Button sx={{ mt: 2 }} onClick={() => navigate(`${base}/lessons`)}>
        ← {t("chapter.backToChapters")}
      </Button>

      <AddLessonDialog
        open={adding}
        onClose={() => setAdding(false)}
        chapterId={chapterId}
        chapterName={chapter ? `${t("chapter.one")} ${chapter.chapterNumber}: ${chapter.title}` : ""}
      />
      <AddChapterDialog
        open={renaming}
        onClose={() => setRenaming(false)}
        subjectId={id}
        chapter={chapter}
      />
      <EditLessonDialog open={!!editing} onClose={() => setEditing(null)} lesson={editing} />
      <StudentPreview
        open={!!previewing}
        onClose={() => setPreviewing(null)}
        lesson={previewing}
      />
      <ConfirmDialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={removeTopic}
        busy={deletingTopic}
        itemName={confirming?.title}
        confirmLabel={t("lesson.delete")}
      />
    </BreadcrumbLayout>
  );
};

export default ChapterDetailScreen;
