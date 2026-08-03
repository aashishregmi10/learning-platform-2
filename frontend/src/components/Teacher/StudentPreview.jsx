import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Skeleton,
  Typography,
} from "@mui/material";
import {
  HeadphonesOutlined,
  LinkOutlined,
  OndemandVideoOutlined,
  PictureAsPdfOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import { useT } from "../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../theme";
import RichText from "../Shared/RichText";
import { useGetContentQuery } from "../../store/services/contentApi";

const FILE_ICON = {
  video: OndemandVideoOutlined,
  pdf: PictureAsPdfOutlined,
  audio: HeadphonesOutlined,
};

/**
 * "See what students see."
 *
 * Notes render through the same <RichText> the student reader uses, so this is
 * a genuine preview rather than an approximation. For files and links there is
 * nothing to render — a student gets a player or a redirect — so we say plainly
 * what will happen instead of faking a viewer.
 */
const StudentPreview = ({ open, onClose, lesson, noteHtml }) => {
  const t = useT();

  // When previewing from a lesson row we only hold the stripped listing record,
  // so fetch the real body. The editor passes `noteHtml` for unsaved edits and
  // we use that instead — a preview should reflect what's on screen.
  const needsFetch = open && noteHtml === undefined && lesson?.type === "note";
  const { data: fullRes, isFetching } = useGetContentQuery(lesson?._id, {
    skip: !needsFetch || !lesson?._id,
  });

  if (!lesson) return null;

  const html = noteHtml ?? fullRes?.data?.noteData?.content ?? "";
  const linkTarget = lesson.storage?.fileKey ?? fullRes?.data?.storage?.fileKey;
  const FileIcon = FILE_ICON[lesson.type];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {/* Framed as a student's screen so it can't be mistaken for the editor */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 3,
          py: 1.75,
          bgcolor: statusTokens.info.bg,
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <VisibilityOutlined sx={{ color: statusTokens.info.solid }} />
        <Box>
          <Typography sx={{ fontWeight: 700, color: statusTokens.info.fg, lineHeight: 1.3 }}>
            {t("preview.title")}
          </Typography>
          <Typography variant="caption" sx={{ color: statusTokens.info.fg, opacity: 0.85 }}>
            {t("preview.explain")}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ py: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {lesson.title}
        </Typography>

        {lesson.type === "note" &&
          (isFetching ? (
            <Box sx={{ display: "grid", gap: 1 }}>
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rounded" height={160} />
            </Box>
          ) : html.replace(/<[^>]*>/g, "").trim() || html.includes("<img") ? (
            <RichText html={html} />
          ) : (
            <Typography variant="body2" sx={{ color: tokens.muted }}>
              {t("preview.emptyNote")}
            </Typography>
          ))}

        {FileIcon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              borderRadius: 2,
              border: `1px dashed ${tokens.borderStrong}`,
              color: tokens.muted,
            }}
          >
            <FileIcon sx={{ fontSize: 34, color: statusTokens.info.solid }} />
            <Typography variant="body2">{t("preview.fileNote")}</Typography>
          </Box>
        )}

        {lesson.type === "link" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              borderRadius: 2,
              border: `1px dashed ${tokens.borderStrong}`,
            }}
          >
            <LinkOutlined sx={{ fontSize: 30, color: statusTokens.warning.solid }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ color: tokens.muted }}>
                {t("preview.linkNote")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--primary)", wordBreak: "break-all", fontWeight: 600 }}
              >
                {linkTarget}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained">
          {t("preview.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentPreview;
