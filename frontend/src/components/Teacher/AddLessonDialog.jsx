import { useState } from "react";
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
import {
  ArrowBackOutlined,
  ArticleOutlined,
  CheckCircle,
  LinkOutlined,
  OndemandVideoOutlined,
  PictureAsPdfOutlined,
} from "@mui/icons-material";

import { useT } from "../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../theme";
import NoteEditor from "./NoteEditor";
import { useCreateContentMutation } from "../../store/services/contentApi";

/**
 * Two-step "add a lesson" flow, replacing the inline form that asked teachers
 * for a content-type enum and a manual sort order.
 *
 *   Step 1 — pick what you're adding, described in plain words with an icon.
 *   Step 2 — fill in only the fields that kind actually needs.
 *
 * `order` is gone entirely: new lessons append to the end of the chapter, which
 * is what "add" means to everyone who isn't holding the schema.
 */
const KINDS = [
  { value: "note", icon: ArticleOutlined, tone: "info" },
  { value: "pdf", icon: PictureAsPdfOutlined, tone: "danger" },
  { value: "video", icon: OndemandVideoOutlined, tone: "success" },
  { value: "link", icon: LinkOutlined, tone: "warning" },
];

const NEEDS_FILE = ["video", "pdf"];
const ACCEPT = { pdf: "application/pdf", video: "video/*" };

const KindCard = ({ kind, selected, onSelect }) => {
  const t = useT();
  const tone = statusTokens[kind.tone];
  const Icon = kind.icon;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      sx={{
        cursor: "pointer",
        border: `2px solid ${selected ? tone.solid : tokens.border}`,
        bgcolor: selected ? tone.bg : tokens.surface,
        borderRadius: 2.5,
        p: 2,
        display: "flex",
        gap: 1.75,
        alignItems: "flex-start",
        transition: "border-color .15s, background-color .15s",
        "&:hover": { borderColor: tone.solid, bgcolor: tone.bg },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 2,
          bgcolor: tone.bg,
          color: tone.solid,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: tokens.ink }}>
          {t(`kind.${kind.value}`)}
        </Typography>
        <Typography variant="caption" sx={{ color: tokens.muted, lineHeight: 1.45, display: "block" }}>
          {t(`kind.${kind.value}Desc`)}
        </Typography>
      </Box>
      {selected && <CheckCircle sx={{ color: tone.solid, fontSize: 20, flexShrink: 0 }} />}
    </Box>
  );
};

const AddLessonDialog = ({ open, onClose, chapterId, chapterName }) => {
  const t = useT();
  const [createContent, { isLoading }] = useCreateContentMutation();

  const [kind, setKind] = useState(null);
  const [title, setTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [file, setFile] = useState(null);

  const reset = () => {
    setKind(null);
    setTitle("");
    setNoteContent("");
    setLinkUrl("");
    setIsFree(false);
    setFile(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const canSubmit =
    !!title.trim() &&
    (kind === "note" ? !!noteContent.trim() : true) &&
    (kind === "link" ? !!linkUrl.trim() : true) &&
    (NEEDS_FILE.includes(kind) ? !!file : true);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("chapter", chapterId);
    fd.append("type", kind);
    fd.append("title", title.trim());
    fd.append("isFree", String(isFree));
    if (kind === "note") fd.append("noteContent", noteContent);
    if (kind === "link") fd.append("linkUrl", linkUrl.trim());
    if (NEEDS_FILE.includes(kind)) fd.append("file", file);

    try {
      await createContent(fd).unwrap();
      toast.success(t("action.saved"));
      close();
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : close} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: "1.1rem", fontWeight: 700, pb: 0.5 }}>
        {kind ? t(`kind.${kind}`) : t("lesson.kindQuestion")}
        {chapterName && (
          <Typography variant="caption" sx={{ display: "block", color: tokens.muted, fontWeight: 400, mt: 0.25 }}>
            {chapterName}
          </Typography>
        )}
      </DialogTitle>

      {/* Step 1 — what kind of thing is this? */}
      {!kind && (
        <>
          <DialogContent sx={{ display: "grid", gap: 1.5, pt: 2 }}>
            {KINDS.map((k) => (
              <KindCard key={k.value} kind={k} selected={false} onSelect={() => setKind(k.value)} />
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={close}>{t("action.cancel")}</Button>
          </DialogActions>
        </>
      )}

      {/* Step 2 — only the fields this kind needs */}
      {kind && (
        <Box component="form" onSubmit={submit}>
          <DialogContent sx={{ display: "grid", gap: 2.5, pt: 2 }}>
            <TextField
              autoFocus
              required
              label={t("lesson.titleLabel")}
              placeholder={t("lesson.titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {kind === "note" && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                  {t("lesson.notesLabel")}
                </Typography>
                <NoteEditor value={noteContent} onChange={setNoteContent} minHeight={220} />
              </Box>
            )}

            {kind === "link" && (
              <TextField
                required
                type="url"
                label={t("lesson.linkLabel")}
                placeholder="https://…"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            )}

            {NEEDS_FILE.includes(kind) && (
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  size="large"
                  fullWidth
                  sx={{ py: 2, borderStyle: "dashed", borderWidth: 2 }}
                >
                  {file ? `✓ ${file.name}` : t("lesson.fileChoose")}
                  <input
                    type="file"
                    hidden
                    accept={ACCEPT[kind]}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
              </Box>
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
                control={<Switch checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />}
                label={t("lesson.freeLabel")}
                slotProps={{ typography: { fontSize: "0.9rem" } }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
            <Button
              startIcon={<ArrowBackOutlined />}
              onClick={() => setKind(null)}
              disabled={isLoading}
            >
              {t("action.back")}
            </Button>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={close} disabled={isLoading}>
                {t("action.cancel")}
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading || !canSubmit}>
                {isLoading ? t("lesson.uploading") : t("action.save")}
              </Button>
            </Box>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
};

export default AddLessonDialog;
