import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  FormControlLabel,
  Paper,
  Skeleton,
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
  VisibilityOutlined,
} from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import SaveStatus from "../../../../components/Shared/SaveStatus";
import NoteEditor from "../../../../components/Teacher/NoteEditor";
import StudentPreview from "../../../../components/Teacher/StudentPreview";
import { useT } from "../../../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../../../theme";
import { useAutosave } from "../../../../hooks/useAutosave";
import { useAuth } from "../../../../hooks/useAuth";
import { useGetSubjectQuery } from "../../../../store/services/subjectApi";
import { useGetChapterQuery } from "../../../../store/services/chapterApi";
import {
  useGetContentQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
} from "../../../../store/services/contentApi";

const KINDS = [
  { value: "note", icon: ArticleOutlined, tone: "info" },
  { value: "pdf", icon: PictureAsPdfOutlined, tone: "danger" },
  { value: "video", icon: OndemandVideoOutlined, tone: "success" },
  { value: "link", icon: LinkOutlined, tone: "warning" },
];

const NEEDS_FILE = ["video", "pdf"];
const ACCEPT = { pdf: "application/pdf", video: "video/*" };

const KindCard = ({ kind, onSelect }) => {
  const t = useT();
  const tone = statusTokens[kind.tone];
  const Icon = kind.icon;

  return (
    <Paper
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        p: 2.5,
        display: "flex",
        gap: 2,
        alignItems: "center",
        transition: "border-color .15s, background-color .15s",
        "&:hover": { borderColor: tone.solid, bgcolor: tone.bg },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: 2,
          bgcolor: tone.bg,
          color: tone.solid,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700 }}>{t(`kind.${kind.value}`)}</Typography>
        <Typography variant="caption" sx={{ color: tokens.muted, lineHeight: 1.45, display: "block" }}>
          {t(`kind.${kind.value}Desc`)}
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * Create or edit one topic, on its own page.
 *
 * Creating is still two steps — pick what kind of thing you're adding, then
 * fill in only the fields that kind needs — but as a full screen the note
 * editor finally has room to work in. Editing skips step one, since a topic's
 * kind is fixed once its file/body exists.
 */
const TopicFormScreen = () => {
  const { id, chapterId, topicId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const { role } = useAuth();
  const isEdit = !!topicId;
  const isTeacher = role === "teacher";
  const base = isTeacher ? `/app/teacher/subjects/${id}` : `/app/admin/catalog/subjects/${id}`;
  const chapterPath = `${base}/chapters/${chapterId}`;

  const { data: subjectRes } = useGetSubjectQuery(id);
  const { data: chapterRes } = useGetChapterQuery(chapterId);
  // /contents/list strips the note body, so editing must load the full doc.
  const { data: fullRes, isFetching: loadingTopic } = useGetContentQuery(topicId, {
    skip: !isEdit,
    refetchOnMountOrArgChange: true,
  });

  const [createContent, { isLoading: creating }] = useCreateContentMutation();
  const [updateContent, { isLoading: updating }] = useUpdateContentMutation();
  const busy = creating || updating;

  const subject = subjectRes?.data;
  const chapter = chapterRes?.data;
  const existing = fullRes?.data;

  const [kind, setKind] = useState(null);
  const [title, setTitle] = useState("");
  const [noteHtml, setNoteHtml] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [file, setFile] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setKind(existing.type);
    setTitle(existing.title ?? "");
    setNoteHtml(existing.noteData?.content ?? "");
    setLinkUrl(existing.type === "link" ? existing.storage?.fileKey ?? "" : "");
    setIsFree(!!existing.isFree);
  }, [existing]);

  // Long-form writing autosaves while editing — never on create, where there's
  // no document to save into yet.
  const { status, save: autosaveNote } = useAutosave((html) =>
    updateContent({ id: topicId, noteContent: html }).unwrap()
  );

  const onNoteChange = (html) => {
    setNoteHtml(html);
    if (isEdit) autosaveNote(html);
  };

  const canSubmit =
    !!title.trim() &&
    (kind === "note" ? !!noteHtml.replace(/<[^>]*>/g, "").trim() || noteHtml.includes("<img") : true) &&
    (kind === "link" ? !!linkUrl.trim() : true) &&
    (!isEdit && NEEDS_FILE.includes(kind) ? !!file : true);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateContent({
          id: topicId,
          title: title.trim(),
          isFree,
          ...(kind === "note" ? { noteContent: noteHtml } : {}),
          ...(kind === "link" ? { linkUrl: linkUrl.trim() } : {}),
        }).unwrap();
      } else {
        const fd = new FormData();
        fd.append("chapter", chapterId);
        fd.append("type", kind);
        fd.append("title", title.trim());
        fd.append("isFree", String(isFree));
        if (kind === "note") fd.append("noteContent", noteHtml);
        if (kind === "link") fd.append("linkUrl", linkUrl.trim());
        if (NEEDS_FILE.includes(kind)) fd.append("file", file);
        await createContent(fd).unwrap();
      }
      toast.success(t("action.saved"));
      navigate(chapterPath);
    } catch (err) {
      toast.error(err?.data?.message || t("action.saveFailed"));
    }
  };

  const crumbs = [
    {
      title: t("nav.mySubjects"),
      path: isTeacher ? "/app/teacher/subjects" : "/app/admin/catalog/subjects",
    },
    { title: subject?.name || "…", path: base },
    { title: t("subject.lessons"), path: `${base}/lessons` },
    {
      title: chapter ? `${t("chapter.one")} ${chapter.chapterNumber}` : "…",
      path: chapterPath,
    },
    { title: isEdit ? t("lesson.editTitle") : t("topic.add") },
  ];

  // Step 1 — what kind of thing is this? (create only)
  if (!isEdit && !kind) {
    return (
      <BreadcrumbLayout breadcrumbs={crumbs}>
        <BreadcrumbLayout.Paper sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              {t("lesson.kindQuestion")}
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.muted, mb: 3 }}>
              {chapter ? `${t("chapter.one")} ${chapter.chapterNumber}: ${chapter.title}` : ""}
            </Typography>

            <Box sx={{ display: "grid", gap: 1.5 }}>
              {KINDS.map((k) => (
                <KindCard key={k.value} kind={k} onSelect={() => setKind(k.value)} />
              ))}
            </Box>

            <Button sx={{ mt: 3 }} onClick={() => navigate(chapterPath)}>
              {t("action.cancel")}
            </Button>
          </Box>
        </BreadcrumbLayout.Paper>
      </BreadcrumbLayout>
    );
  }

  // Step 2 — the fields this kind actually needs
  return (
    <BreadcrumbLayout breadcrumbs={crumbs} isBusy={busy || loadingTopic}>
      <BreadcrumbLayout.Paper sx={{ p: { xs: 2.5, md: 4 } }}>
        <Box sx={{ maxWidth: 860 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                {isEdit ? t("lesson.editTitle") : t(`kind.${kind}`)}
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.muted }}>
                {t(`kind.${kind}`)}
                {chapter ? ` · ${t("chapter.one")} ${chapter.chapterNumber}: ${chapter.title}` : ""}
              </Typography>
            </Box>
            {isEdit && kind === "note" && <SaveStatus status={status} />}
          </Box>

          {loadingTopic ? (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={320} />
            </Box>
          ) : (
            <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 3 }}>
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
                  <NoteEditor
                    key={topicId ?? "new"}
                    value={noteHtml}
                    onChange={onNoteChange}
                    minHeight={380}
                  />
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

              {NEEDS_FILE.includes(kind) &&
                (isEdit ? (
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
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    size="large"
                    fullWidth
                    sx={{ py: 2.5, borderStyle: "dashed", borderWidth: 2 }}
                  >
                    {file ? `✓ ${file.name}` : t("lesson.fileChoose")}
                    <input
                      type="file"
                      hidden
                      accept={ACCEPT[kind]}
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </Button>
                ))}

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

              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {!isEdit && (
                    <Button startIcon={<ArrowBackOutlined />} onClick={() => setKind(null)} disabled={busy}>
                      {t("action.back")}
                    </Button>
                  )}
                  <Button
                    startIcon={<VisibilityOutlined />}
                    onClick={() => setPreviewing(true)}
                    sx={{ color: statusTokens.info.fg }}
                  >
                    {t("preview.open")}
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button onClick={() => navigate(chapterPath)} disabled={busy}>
                    {t("action.cancel")}
                  </Button>
                  <Button type="submit" variant="contained" disabled={busy || !canSubmit}>
                    {busy ? t("lesson.uploading") : t("action.save")}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </BreadcrumbLayout.Paper>

      <StudentPreview
        open={previewing}
        onClose={() => setPreviewing(false)}
        lesson={{ ...(existing ?? {}), _id: topicId, type: kind, title, storage: { fileKey: linkUrl } }}
        noteHtml={noteHtml}
      />
    </BreadcrumbLayout>
  );
};

export default TopicFormScreen;
