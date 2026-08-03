import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { VisibilityOutlined } from "@mui/icons-material";

import { useT } from "../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../theme";
import { useAutosave } from "../../hooks/useAutosave";
import SaveStatus from "../Shared/SaveStatus";
import NoteEditor from "./NoteEditor";
import StudentPreview from "./StudentPreview";
import {
  useGetContentQuery,
  useUpdateContentMutation,
} from "../../store/services/contentApi";

/**
 * Edit an existing lesson. Previously there was no way to fix a typo — a
 * teacher's only option was delete and re-add, which lost the lesson's place.
 *
 * The note body autosaves as it's typed (that's the long-form field where
 * losing work hurts most); title and switches commit on Save. "See what
 * students see" is one click away so a teacher can check their work without
 * logging in as somebody else.
 */
const EditLessonDialog = ({ open, onClose, lesson }) => {
  const t = useT();
  const [updateContent, { isLoading }] = useUpdateContentMutation();

  // The row data from /contents/list has no note body — it's stripped server
  // side. Load the real document before showing the editor, or we'd render an
  // empty box and then save that emptiness over the teacher's work.
  const { data: fullRes, isFetching: loadingBody } = useGetContentQuery(lesson?._id, {
    skip: !open || !lesson?._id,
    refetchOnMountOrArgChange: true,
  });
  const full = fullRes?.data;

  const [title, setTitle] = useState("");
  const [noteHtml, setNoteHtml] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (!open || !full) return;
    setTitle(full.title ?? "");
    setNoteHtml(full.noteData?.content ?? "");
    setLinkUrl(full.type === "link" ? full.storage?.fileKey ?? "" : "");
    setIsFree(!!full.isFree);
  }, [open, full]);

  // Long-form writing autosaves; teachers shouldn't have to remember to save.
  const { status, save: autosaveNote } = useAutosave((html) =>
    updateContent({ id: lesson._id, noteContent: html }).unwrap()
  );

  const onNoteChange = (html) => {
    setNoteHtml(html);
    autosaveNote(html);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await updateContent({
        id: lesson._id,
        title: title.trim(),
        isFree,
        ...(lesson.type === "note" ? { noteContent: noteHtml } : {}),
        ...(lesson.type === "link" ? { linkUrl: linkUrl.trim() } : {}),
      }).unwrap();
      toast.success(t("action.saved"));
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  if (!lesson) return null;

  return (
    <>
      <Dialog open={open} onClose={isLoading ? undefined : onClose} fullWidth maxWidth="md">
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
        >
          <Box>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
              {t("lesson.editTitle")}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.muted }}>
              {t(`kind.${lesson.type}`)}
            </Typography>
          </Box>
          {lesson.type === "note" && <SaveStatus status={status} />}
        </DialogTitle>

        <Box component="form" onSubmit={submit}>
          <DialogContent sx={{ display: "grid", gap: 2.5, pt: 2 }}>
            {loadingBody ? (
              <Box sx={{ display: "grid", gap: 2 }}>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={280} />
              </Box>
            ) : (
              <>
                <TextField
                  required
                  label={t("lesson.titleLabel")}
                  placeholder={t("lesson.titlePlaceholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                {lesson.type === "note" && (
                  // Keyed on the id so switching lessons remounts the editor
                  // with the new body instead of keeping the old one.
                  <NoteEditor key={lesson._id} value={noteHtml} onChange={onNoteChange} />
                )}

                {lesson.type === "link" && (
                  <TextField
                    required
                    type="url"
                    label={t("lesson.linkLabel")}
                    placeholder="https://…"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                )}

                {/* Uploaded files aren't replaceable in place — say so rather
                    than showing a control that silently does nothing. */}
                {["video", "pdf", "audio"].includes(lesson.type) && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: tokens.muted,
                      bgcolor: tokens.surfaceMuted,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    {t("lesson.fileReplaceHint")}
                  </Typography>
                )}

                <Box
                  sx={{
                    border: `1px solid ${tokens.border}`,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    bgcolor: tokens.surfaceMuted,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
                    }
                    label={t("lesson.freeLabel")}
                    slotProps={{ typography: { fontSize: "0.9rem" } }}
                  />
                </Box>
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
            <Button
              startIcon={<VisibilityOutlined />}
              onClick={() => setPreviewing(true)}
              sx={{ color: statusTokens.info.fg }}
            >
              {t("preview.open")}
            </Button>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={onClose} disabled={isLoading}>
                {t("action.cancel")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || loadingBody || !title.trim()}
              >
                {t("action.save")}
              </Button>
            </Box>
          </DialogActions>
        </Box>
      </Dialog>

      <StudentPreview
        open={previewing}
        onClose={() => setPreviewing(false)}
        lesson={{ ...lesson, title }}
        noteHtml={noteHtml}
      />
    </>
  );
};

export default EditLessonDialog;
