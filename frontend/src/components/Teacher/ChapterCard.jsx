import { useState } from "react";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import {
  AddOutlined,
  ArticleOutlined,
  DeleteOutlineOutlined,
  DriveFileRenameOutlineOutlined,
  EditOutlined,
  ExpandMoreOutlined,
  HeadphonesOutlined,
  LinkOutlined,
  MoreVertOutlined,
  OndemandVideoOutlined,
  PictureAsPdfOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import { useT } from "../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../theme";
import { relativeTime } from "../../utils/relativeTime";
import ConfirmDialog from "../Shared/ConfirmDialog";
import AddLessonDialog from "./AddLessonDialog";
import AddChapterDialog from "./AddChapterDialog";
import EditLessonDialog from "./EditLessonDialog";
import StudentPreview from "./StudentPreview";
import {
  useGetContentsQuery,
  useDeleteContentMutation,
} from "../../store/services/contentApi";
import {
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} from "../../store/services/chapterApi";

const KIND_ICON = {
  note: ArticleOutlined,
  pdf: PictureAsPdfOutlined,
  video: OndemandVideoOutlined,
  link: LinkOutlined,
  audio: HeadphonesOutlined,
};

const KIND_TONE = {
  note: "info",
  pdf: "danger",
  video: "success",
  link: "warning",
  audio: "neutral",
};

/**
 * One chapter, with its lessons.
 *
 * Deliberate choices after teacher feedback on the first version:
 *  - every action carries a text label, so nothing has to be guessed
 *  - Delete lives in an overflow menu, away from the everyday buttons, and
 *    always goes through a confirmation naming the exact item
 *  - visibility reads "Students can see this" / "Only you can see this"
 *    instead of Published / Draft
 */
const ChapterCard = ({ chapter, subjectId, defaultOpen = false }) => {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const [menuEl, setMenuEl] = useState(null);
  const [addingLesson, setAddingLesson] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmChapter, setConfirmChapter] = useState(false);
  const [confirmLesson, setConfirmLesson] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [previewLesson, setPreviewLesson] = useState(null);

  const { data } = useGetContentsQuery({ chapter: chapter._id });
  const [updateChapter, { isLoading: toggling }] = useUpdateChapterMutation();
  const [deleteChapter, { isLoading: deletingChapter }] = useDeleteChapterMutation();
  const [deleteContent, { isLoading: deletingLesson }] = useDeleteContentMutation();

  const lessons = data?.data ?? [];
  const visible = chapter.isPublished;
  const tone = visible ? statusTokens.success : statusTokens.warning;

  const toggleVisibility = async () => {
    try {
      await updateChapter({ id: chapter._id, isPublished: !visible }).unwrap();
      toast.success(t("action.saved"));
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  const removeChapter = async () => {
    try {
      await deleteChapter(chapter._id).unwrap();
      setConfirmChapter(false);
      toast.success(t("action.done"));
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  const removeLesson = async () => {
    try {
      await deleteContent(confirmLesson._id).unwrap();
      setConfirmLesson(null);
      toast.success(t("action.done"));
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      {/* Header — title, plain-language visibility, expand */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          bgcolor: tokens.surfaceMuted,
          cursor: "pointer",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <ExpandMoreOutlined
          sx={{
            color: tokens.muted,
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: tokens.ink }}>
            {t("chapter.one")} {chapter.chapterNumber}: {chapter.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
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
              {lessons.length} {t("chapter.lessonCount")}
              {chapter.updatedAt ? ` · ${t("chapter.lastEdited")} ${relativeTime(chapter.updatedAt)}` : ""}
            </Typography>
          </Box>
        </Box>

        {/* Overflow — the only place destructive actions live */}
        <IconButton
          size="small"
          aria-label={t("action.done")}
          onClick={(e) => {
            e.stopPropagation();
            setMenuEl(e.currentTarget);
          }}
        >
          <MoreVertOutlined sx={{ fontSize: 20, color: tokens.muted }} />
        </IconButton>
      </Box>

      <Menu anchorEl={menuEl} open={!!menuEl} onClose={() => setMenuEl(null)}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            setRenaming(true);
          }}
        >
          <DriveFileRenameOutlineOutlined sx={{ fontSize: 18, mr: 1.25, color: tokens.muted }} />
          {t("chapter.rename")}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            setConfirmChapter(true);
          }}
          sx={{ color: statusTokens.danger.fg }}
        >
          <DeleteOutlineOutlined sx={{ fontSize: 18, mr: 1.25 }} />
          {t("chapter.delete")}
        </MenuItem>
      </Menu>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ borderTop: `1px solid ${tokens.border}` }}>
          {lessons.length === 0 && (
            <Typography variant="body2" sx={{ color: tokens.muted, px: 2.5, py: 3, textAlign: "center" }}>
              {t("chapter.noLessons")}
            </Typography>
          )}

          {lessons.map((lesson, i) => {
            const Icon = KIND_ICON[lesson.type] ?? ArticleOutlined;
            const lessonTone = statusTokens[KIND_TONE[lesson.type] ?? "neutral"];
            return (
              <Box
                key={lesson._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2.5,
                  py: 1.5,
                  borderTop: i === 0 ? "none" : `1px solid ${tokens.border}`,
                  "&:hover": { bgcolor: tokens.surfaceMuted },
                  "&:hover .lesson-delete": { opacity: 1 },
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    bgcolor: lessonTone.bg,
                    color: lessonTone.solid,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 17 }} />
                </Box>

                <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0, color: tokens.body }}>
                  <strong style={{ color: tokens.muted, fontWeight: 600 }}>
                    {chapter.chapterNumber}.{i + 1}
                  </strong>{" "}
                  {lesson.title}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: lessonTone.fg, fontWeight: 700, flexShrink: 0 }}
                >
                  {t(`kind.${lesson.type}`)}
                </Typography>

                {lesson.isFree && (
                  <Typography
                    variant="caption"
                    sx={{ color: statusTokens.success.fg, fontWeight: 700, flexShrink: 0 }}
                  >
                    {t("visible.free")}
                  </Typography>
                )}

                {/* Row actions, in the order a teacher reaches for them:
                    check it, change it, and only then remove it. */}
                <Button
                  size="small"
                  startIcon={<VisibilityOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => setPreviewLesson(lesson)}
                  sx={{ flexShrink: 0, minWidth: 0 }}
                >
                  {t("preview.open")}
                </Button>
                <Button
                  size="small"
                  startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => setEditingLesson(lesson)}
                  sx={{ flexShrink: 0, minWidth: 0 }}
                >
                  {t("action.edit")}
                </Button>
                <IconButton
                  className="lesson-delete"
                  size="small"
                  aria-label={`${t("lesson.delete")}: ${lesson.title}`}
                  onClick={() => setConfirmLesson(lesson)}
                  sx={{ opacity: 0, transition: "opacity .15s", color: statusTokens.danger.solid }}
                >
                  <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            );
          })}

          {/* Everyday actions — all labelled, delete is NOT among them */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              px: 2.5,
              py: 2,
              borderTop: `1px solid ${tokens.border}`,
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => setAddingLesson(true)}
            >
              {lessons.length === 0 ? t("lesson.addFirst") : t("lesson.add")}
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
      </Collapse>

      <AddLessonDialog
        open={addingLesson}
        onClose={() => setAddingLesson(false)}
        chapterId={chapter._id}
        chapterName={`${t("chapter.one")} ${chapter.chapterNumber}: ${chapter.title}`}
      />

      <AddChapterDialog
        open={renaming}
        onClose={() => setRenaming(false)}
        subjectId={subjectId}
        chapter={chapter}
      />

      <ConfirmDialog
        open={confirmChapter}
        onClose={() => setConfirmChapter(false)}
        onConfirm={removeChapter}
        busy={deletingChapter}
        itemName={`${t("chapter.one")} ${chapter.chapterNumber}: ${chapter.title}`}
        body={t("confirm.deleteChapter")}
        confirmLabel={t("chapter.delete")}
      />

      <ConfirmDialog
        open={!!confirmLesson}
        onClose={() => setConfirmLesson(null)}
        onConfirm={removeLesson}
        busy={deletingLesson}
        itemName={confirmLesson?.title}
        confirmLabel={t("lesson.delete")}
      />

      <EditLessonDialog
        open={!!editingLesson}
        onClose={() => setEditingLesson(null)}
        lesson={editingLesson}
      />

      <StudentPreview
        open={!!previewLesson}
        onClose={() => setPreviewLesson(null)}
        lesson={previewLesson}
      />
    </Paper>
  );
};

export default ChapterCard;
