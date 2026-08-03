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
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useT } from "../../i18n/LanguageContext";
import { tokens } from "../../theme";
import {
  useCreateChapterMutation,
  useUpdateChapterMutation,
} from "../../store/services/chapterApi";

/**
 * Add or rename a chapter. One real question — what's it called — plus an
 * optional free-preview switch explained in a sentence.
 *
 * The chapter number is computed from what's already there rather than typed:
 * teachers add chapters in order, and asking for a number invites clashes.
 */
const AddChapterDialog = ({ open, onClose, subjectId, nextNumber = 1, chapter = null }) => {
  const t = useT();
  const isEdit = !!chapter;

  const [createChapter, { isLoading: creating }] = useCreateChapterMutation();
  const [updateChapter, { isLoading: updating }] = useUpdateChapterMutation();
  const busy = creating || updating;

  const [title, setTitle] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(chapter?.title ?? "");
    setIsFreePreview(chapter?.isFreePreview ?? false);
  }, [open, chapter]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateChapter({ id: chapter._id, title: title.trim(), isFreePreview }).unwrap();
      } else {
        await createChapter({
          subject: subjectId,
          chapterNumber: nextNumber,
          title: title.trim(),
          isFreePreview,
        }).unwrap();
      }
      toast.success(t("action.saved"));
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
        {isEdit ? t("chapter.rename") : t("chapter.add")}
        {!isEdit && (
          <Typography variant="caption" sx={{ display: "block", color: tokens.muted, fontWeight: 400, mt: 0.25 }}>
            {t("chapter.one")} {nextNumber}
          </Typography>
        )}
      </DialogTitle>

      <Box component="form" onSubmit={submit}>
        <DialogContent sx={{ display: "grid", gap: 2.5, pt: 2 }}>
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
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={busy}>
            {t("action.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={busy || !title.trim()}>
            {t("action.save")}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddChapterDialog;
