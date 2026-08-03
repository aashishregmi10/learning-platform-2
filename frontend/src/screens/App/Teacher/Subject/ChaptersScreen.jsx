import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, IconButton, Menu, MenuItem, Paper, Typography, Divider } from "@mui/material";
import {
  AddOutlined,
  ChevronRightOutlined,
  DeleteOutlineOutlined,
  DriveFileRenameOutlineOutlined,
  MenuBookOutlined,
  MoreVertOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import BigEmptyState from "../../../../components/Shared/BigEmptyState";
import ConfirmDialog from "../../../../components/Shared/ConfirmDialog";
import { useT } from "../../../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../../../theme";
import { relativeTime } from "../../../../utils/relativeTime";
import { useAuth } from "../../../../hooks/useAuth";
import { useGetSubjectQuery } from "../../../../store/services/subjectApi";
import {
  useGetChaptersQuery,
  useDeleteChapterMutation,
} from "../../../../store/services/chapterApi";

/**
 * Level 1 of authoring: the chapters in a subject.
 *
 * This screen only ever deals with chapters — create, rename, show/hide,
 * delete, open. The topics inside a chapter get their own screen, so a teacher
 * is never looking at two levels of the hierarchy at once.
 */
const ChapterRow = ({ chapter, onOpen, onRename, onDelete }) => {
  const t = useT();
  const [menuEl, setMenuEl] = useState(null);
  const visible = chapter.isPublished;
  const tone = visible ? statusTokens.success : statusTokens.warning;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        cursor: "pointer",
        transition: "border-color .15s, background-color .15s",
        "&:hover": { borderColor: statusTokens.info.solid, bgcolor: statusTokens.info.bg },
      }}
      onClick={onOpen}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          flexShrink: 0,
          borderRadius: 2,
          bgcolor: statusTokens.info.bg,
          color: statusTokens.info.fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "1.05rem",
        }}
      >
        {chapter.chapterNumber}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>{chapter.title}</Typography>
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
          {chapter.updatedAt && (
            <Typography variant="caption" sx={{ color: tokens.muted }}>
              {t("chapter.lastEdited")} {relativeTime(chapter.updatedAt)}
            </Typography>
          )}
        </Box>
      </Box>

      <Button
        variant="outlined"
        endIcon={<ChevronRightOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        sx={{ flexShrink: 0, display: { xs: "none", sm: "inline-flex" } }}
      >
        {t("chapter.manageTopics")}
      </Button>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setMenuEl(e.currentTarget);
        }}
      >
        <MoreVertOutlined sx={{ fontSize: 20, color: tokens.muted }} />
      </IconButton>

      <Menu anchorEl={menuEl} open={!!menuEl} onClose={() => setMenuEl(null)} onClick={(e) => e.stopPropagation()}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            onRename();
          }}
        >
          <DriveFileRenameOutlineOutlined sx={{ fontSize: 18, mr: 1.25, color: tokens.muted }} />
          {t("chapter.rename")}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            onDelete();
          }}
          sx={{ color: statusTokens.danger.fg }}
        >
          <DeleteOutlineOutlined sx={{ fontSize: 18, mr: 1.25 }} />
          {t("chapter.delete")}
        </MenuItem>
      </Menu>
    </Paper>
  );
};

const ChaptersScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const { role } = useAuth();
  const isTeacher = role === "teacher";
  const base = isTeacher ? `/app/teacher/subjects/${id}` : `/app/admin/catalog/subjects/${id}`;

  const { data: subjectRes, isLoading } = useGetSubjectQuery(id);
  const { data: chaptersRes, isFetching } = useGetChaptersQuery({ subject: id });
  const [deleteChapter, { isLoading: deleting }] = useDeleteChapterMutation();

  const [confirming, setConfirming] = useState(null);

  const subject = subjectRes?.data;
  const chapters = chaptersRes?.data ?? [];

  const removeChapter = async () => {
    try {
      await deleteChapter(confirming._id).unwrap();
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
        { title: t("subject.lessons") },
      ]}
      isBusy={isLoading || isFetching}
      headerActions={
        chapters.length > 0 && (
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate(`${base}/chapters/create`)}>
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
          onAction={() => navigate(`${base}/chapters/create`)}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {chapters.map((ch) => (
            <ChapterRow
              key={ch._id}
              chapter={ch}
              onOpen={() => navigate(`${base}/chapters/${ch._id}`)}
              onRename={() => navigate(`${base}/chapters/${ch._id}/edit`)}
              onDelete={() => setConfirming(ch)}
            />
          ))}

          <Button
            onClick={() => navigate(`${base}/chapters/create`)}
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

      <ConfirmDialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={removeChapter}
        busy={deleting}
        itemName={confirming ? `${t("chapter.one")} ${confirming.chapterNumber}: ${confirming.title}` : ""}
        body={t("confirm.deleteChapter")}
        confirmLabel={t("chapter.delete")}
      />
    </BreadcrumbLayout>
  );
};

export default ChaptersScreen;
