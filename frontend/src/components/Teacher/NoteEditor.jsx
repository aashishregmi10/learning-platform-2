import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Box, Divider, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  ImageOutlined,
  TitleOutlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  DeleteOutlineOutlined,
} from "@mui/icons-material";

import { useT } from "../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../theme";
import { richTextSx, sanitizeNote } from "../Shared/RichText";
import { useUploadNoteImageMutation } from "../../store/services/contentApi";

/**
 * Note editor for teachers.
 *
 * Deliberately WYSIWYG rather than markdown: a teacher who has never written
 * markdown shouldn't have to learn `![](url)` to put a diagram next to a
 * paragraph. What they see in this box is what the student sees, because the
 * editing surface reuses `richTextSx` — the same styles the reader applies.
 *
 * Images: pick one, it uploads, and it lands where the cursor was. Clicking an
 * image afterwards reveals placement controls (left / centre / right), which
 * write the same align-* classes the student renderer understands.
 *
 * Implementation note: this uses `document.execCommand`, which is formally
 * deprecated but still the only universally-supported way to do this without
 * pulling in a large editor framework. Every browser we target implements it.
 */
const ToolbarButton = ({ title, onClick, children, active }) => (
  <Tooltip title={title}>
    <IconButton
      size="small"
      onMouseDown={(e) => e.preventDefault()} // keep the caret in the note
      onClick={onClick}
      sx={{
        borderRadius: 1.5,
        color: active ? statusTokens.info.fg : tokens.muted,
        bgcolor: active ? statusTokens.info.bg : "transparent",
        "&:hover": { bgcolor: statusTokens.info.bg, color: statusTokens.info.fg },
      }}
    >
      {children}
    </IconButton>
  </Tooltip>
);

const NoteEditor = ({ value, onChange, minHeight = 260 }) => {
  const t = useT();
  const ref = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadImage, { isLoading: uploading }] = useUploadNoteImageMutation();

  // Seed the editor once. We deliberately do NOT sync on every value change —
  // rewriting innerHTML mid-typing would throw the caret to the start.
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = sanitizeNote(value || "");
    }
  }, [value]);

  const emit = useCallback(() => {
    onChange(ref.current?.innerHTML ?? "");
  }, [onChange]);

  const exec = (command, arg) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    emit();
  };

  const insertImage = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await uploadImage(fd).unwrap();
      ref.current?.focus();
      // Default to full width; the teacher can move it after with one click.
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${res.data.url}" alt="" class="align-center" />`
      );
      emit();
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  /** Clicking an image selects it and reveals the placement row. */
  const onEditorClick = (e) => {
    setSelectedImage(e.target.tagName === "IMG" ? e.target : null);
  };

  const alignImage = (align) => {
    if (!selectedImage) return;
    selectedImage.className = `align-${align}`;
    emit();
  };

  const removeImage = () => {
    if (!selectedImage) return;
    selectedImage.remove();
    setSelectedImage(null);
    emit();
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {/* Formatting toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            flexWrap: "wrap",
            px: 1,
            py: 0.75,
            bgcolor: tokens.surfaceMuted,
            borderBottom: `1px solid ${tokens.border}`,
          }}
        >
          <ToolbarButton title={t("editor.bold")} onClick={() => exec("bold")}>
            <FormatBold fontSize="small" />
          </ToolbarButton>
          <ToolbarButton title={t("editor.italic")} onClick={() => exec("italic")}>
            <FormatItalic fontSize="small" />
          </ToolbarButton>
          <ToolbarButton title={t("editor.heading")} onClick={() => exec("formatBlock", "<h3>")}>
            <TitleOutlined fontSize="small" />
          </ToolbarButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />

          <ToolbarButton title={t("editor.bullets")} onClick={() => exec("insertUnorderedList")}>
            <FormatListBulleted fontSize="small" />
          </ToolbarButton>
          <ToolbarButton title={t("editor.numbers")} onClick={() => exec("insertOrderedList")}>
            <FormatListNumbered fontSize="small" />
          </ToolbarButton>
          <ToolbarButton title={t("editor.quote")} onClick={() => exec("formatBlock", "<blockquote>")}>
            <FormatQuote fontSize="small" />
          </ToolbarButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />

          <Tooltip title={t("editor.insertImage")}>
            <IconButton
              component="label"
              size="small"
              disabled={uploading}
              sx={{
                borderRadius: 1.5,
                color: statusTokens.info.fg,
                bgcolor: statusTokens.info.bg,
                "&:hover": { bgcolor: statusTokens.info.bg },
              }}
            >
              <ImageOutlined fontSize="small" />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  insertImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </IconButton>
          </Tooltip>

          <Typography variant="caption" sx={{ ml: 1, color: tokens.muted }}>
            {uploading ? t("editor.uploadingImage") : t("editor.imageHint")}
          </Typography>
        </Box>

        {/* Placement controls — only while an image is selected */}
        {selectedImage && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.75,
              bgcolor: statusTokens.info.bg,
              borderBottom: `1px solid ${tokens.border}`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: statusTokens.info.fg, mr: 0.5 }}>
              {t("editor.placeImage")}
            </Typography>
            <ToolbarButton title={t("editor.alignLeft")} onClick={() => alignImage("left")}>
              <FormatAlignLeft fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title={t("editor.alignCenter")} onClick={() => alignImage("center")}>
              <FormatAlignCenter fontSize="small" />
            </ToolbarButton>
            <ToolbarButton title={t("editor.alignRight")} onClick={() => alignImage("right")}>
              <FormatAlignRight fontSize="small" />
            </ToolbarButton>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={t("editor.removeImage")}>
              <IconButton
                size="small"
                onClick={removeImage}
                sx={{ color: statusTokens.danger.solid }}
              >
                <DeleteOutlineOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* The writing surface — styled exactly like the student's reader */}
        <Box
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onClick={onEditorClick}
          data-placeholder={t("lesson.notesPlaceholder")}
          sx={{
            ...richTextSx,
            minHeight,
            p: 2.5,
            outline: "none",
            "&:empty:before": {
              content: "attr(data-placeholder)",
              color: tokens.faint,
            },
            "& img": { ...richTextSx["& img"], cursor: "pointer" },
            "& img.align-left": richTextSx["& img.align-left"],
            "& img.align-right": richTextSx["& img.align-right"],
            "& img.align-center": richTextSx["& img.align-center"],
          }}
        />
      </Paper>

      <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: tokens.muted }}>
        {t("editor.wysiwygHint")}
      </Typography>
    </Box>
  );
};

export default NoteEditor;
