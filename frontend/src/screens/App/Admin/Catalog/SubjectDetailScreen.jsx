import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  ArticleOutlined,
  LayersOutlined,
  QuizOutlined,
  StarOutlineOutlined,
  VideocamOutlined,
} from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import StatusChip from "../../../../components/Shared/StatusChip";
import { StatCard, StatCardRow } from "../../../../components/Shared/StatCard";
import { tokens } from "../../../../theme";
import { relativeTime } from "../../../../utils/relativeTime";
import { useAuth } from "../../../../hooks/useAuth";
import {
  useGetSubjectQuery,
  useUpdateSubjectMutation,
} from "../../../../store/services/subjectApi";
import {
  useGetChaptersQuery,
  useCreateChapterMutation,
} from "../../../../store/services/chapterApi";
import { useListQuizzesQuery } from "../../../../store/services/quizApi";
import { useListLiveClassesQuery } from "../../../../store/services/liveClassApi";
import { useGetSubjectDoubtsQuery } from "../../../../store/services/doubtApi";
import {
  useGetSubjectReviewsQuery,
  useRespondToReviewMutation,
} from "../../../../store/services/reviewApi";
import DoubtThread from "../../../../components/Student/DoubtThread";
import ChapterPanel from "./ChapterPanel";

const TABS = ["Content", "Quizzes", "Q&A", "Live Classes", "Analytics"];

/** Shared shell for the non-Content tabs: a bordered card with a heading. */
const Panel = ({ title, action, children }) => (
  <BreadcrumbLayout.Paper sx={{ p: 2.5, borderRadius: 2.5 }}>
    {(title || action) && (
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2 }}
      >
        <Typography variant="subtitle1">{title}</Typography>
        {action}
      </Box>
    )}
    {children}
  </BreadcrumbLayout.Paper>
);

const Empty = ({ children }) => (
  <Typography variant="body2" sx={{ color: tokens.muted, py: 3, textAlign: "center" }}>
    {children}
  </Typography>
);

/** A borderless list row — used by the Quizzes and Live Classes tabs. */
const Row = ({ primary, secondary, right }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      py: 1.25,
      borderTop: `1px solid ${tokens.border}`,
      "&:first-of-type": { borderTop: "none" },
    }}
  >
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ color: tokens.ink, fontWeight: 500 }} noWrap>
        {primary}
      </Typography>
      {secondary && <Typography variant="caption">{secondary}</Typography>}
    </Box>
    {right}
  </Box>
);

const ReviewRow = ({ review }) => {
  const [text, setText] = useState(review.response?.text || "");
  const [respondToReview, { isLoading }] = useRespondToReviewMutation();

  const respond = async () => {
    try {
      await respondToReview({ id: review._id, text }).unwrap();
      toast.success("Response posted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  return (
    <Box sx={{ borderTop: `1px solid ${tokens.border}`, py: 1.5 }}>
      <Typography variant="subtitle2">
        {review.student?.name} — {"★".repeat(review.rating)}
        {"☆".repeat(5 - review.rating)}
      </Typography>
      {review.comment && (
        <Typography variant="body2" sx={{ color: tokens.muted }}>
          {review.comment}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Respond to this review…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button size="small" variant="outlined" disabled={isLoading || !text} onClick={respond}>
          Respond
        </Button>
      </Box>
    </Box>
  );
};

const SubjectDetailScreen = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const isTeacher = role === "teacher";

  const { data: subjectRes, isLoading, error } = useGetSubjectQuery(id);
  const { data: chaptersRes } = useGetChaptersQuery({ subject: id });
  const { data: quizzesRes } = useListQuizzesQuery({ subject: id });
  const { data: liveRes } = useListLiveClassesQuery({ subject: id });
  const { data: doubtsRes } = useGetSubjectDoubtsQuery(id, { skip: !id });
  const { data: reviewsRes } = useGetSubjectReviewsQuery({ id }, { skip: !id });

  const [createChapter, { isLoading: creating }] = useCreateChapterMutation();
  const [updateSubject, { isLoading: publishing }] = useUpdateSubjectMutation();

  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chapterNumber: "", title: "", isFreePreview: false });

  const subject = subjectRes?.data;
  const chapters = chaptersRes?.data ?? [];
  const quizzes = quizzesRes?.data ?? [];
  const liveClasses = liveRes?.data ?? [];
  const doubts = doubtsRes?.data ?? [];
  const reviews = reviewsRes?.data?.reviews ?? [];

  const basePath = isTeacher ? "/app/teacher/subjects" : "/app/admin/catalog/subjects";
  const openQuestions = doubts.filter((d) => !d.isResolved).length;
  const topicCount =
    (subject?.totalVideos ?? 0) +
    (subject?.totalPdfs ?? 0) +
    (subject?.totalNotes ?? 0);

  const openDialog = () => {
    // Pre-fill the next number so adding chapters in order takes one field.
    setForm({
      chapterNumber: String(
        chapters.reduce((max, c) => Math.max(max, c.chapterNumber || 0), 0) + 1
      ),
      title: "",
      isFreePreview: false,
    });
    setOpen(true);
  };

  const addChapter = async () => {
    try {
      await createChapter({
        subject: id,
        chapterNumber: Number(form.chapterNumber),
        title: form.title,
        isFreePreview: form.isFreePreview,
      }).unwrap();
      toast.success("Chapter added");
      setOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Could not add chapter");
    }
  };

  const togglePublish = async () => {
    try {
      await updateSubject({ id, isActive: !subject.isActive }).unwrap();
      toast.success(subject.isActive ? "Subject unpublished" : "Subject published");
    } catch (err) {
      toast.error(err?.data?.message || "Could not change publish state");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        ...(isTeacher ? [] : [{ title: "Catalog" }]),
        { title: isTeacher ? "My Subjects" : "Subjects", path: basePath },
        {
          title: subject
            ? `${subject.name}${subject.year?.yearName ? ` — ${subject.year.yearName}` : ""}`
            : "Subject",
        },
      ]}
      isBusy={isLoading || publishing}
      headerActions={
        subject && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <StatusChip active={subject.isActive} />
            <Button variant="contained" onClick={togglePublish} disabled={publishing}>
              {subject.isActive ? "Unpublish subject" : "Publish subject"}
            </Button>
          </Box>
        )
      }
    >
      <BreadcrumbLayout.Error error={error} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
        {TABS.map((t) => (
          <Tab key={t} label={t} />
        ))}
      </Tabs>

      {tab === 0 && (
        <>
          <StatCardRow>
            <StatCard value={chapters.length} label="Chapters" tone="info" icon={<LayersOutlined />} />
            <StatCard value={topicCount} label="Topics" tone="success" icon={<ArticleOutlined />} />
            <StatCard value={quizzes.length} label="Quizzes" tone="warning" icon={<QuizOutlined />} />
            <StatCard
              value={liveClasses.length}
              label="Live sessions"
              tone="danger"
              icon={<VideocamOutlined />}
            />
          </StatCardRow>

          <Box
            sx={{
              mt: 3,
              mb: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Chapters</Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={openDialog}>
              Add chapter
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {chapters.map((ch) => (
              <ChapterPanel key={ch._id} chapter={ch} />
            ))}

            <Button
              onClick={openDialog}
              sx={{
                py: 2,
                border: `1px dashed ${tokens.borderStrong}`,
                borderRadius: 2.5,
                color: tokens.muted,
                fontWeight: 500,
                "&:hover": { borderColor: tokens.ink, color: tokens.ink },
              }}
              startIcon={<Add sx={{ fontSize: 18 }} />}
            >
              {chapters.length === 0 ? "Add the first chapter" : "Add new chapter"}
            </Button>
          </Box>
        </>
      )}

      {tab === 1 && (
        <Panel
          title="Quizzes"
          action={
            <Button
              component={Link}
              to={`/app/${role}/quizzes/create?subject=${id}`}
              variant="outlined"
              startIcon={<Add />}
            >
              New quiz
            </Button>
          }
        >
          {quizzes.length === 0 ? (
            <Empty>No quizzes on this subject yet — build one to check what&apos;s landing.</Empty>
          ) : (
            quizzes.map((q) => (
              <Row
                key={q._id}
                primary={q.title}
                secondary={`${q.questions?.length ?? q.totalQuestions ?? 0} questions${
                  q.passingScore ? ` · pass at ${q.passingScore}%` : ""
                }`}
                right={
                  <Button
                    component={Link}
                    to={`/app/${role}/quizzes/${q._id}/edit`}
                    size="small"
                    variant="outlined"
                  >
                    Edit
                  </Button>
                }
              />
            ))
          )}
        </Panel>
      )}

      {tab === 2 && (
        <Panel title={`Questions from students (${doubts.length})`}>
          <DoubtThread
            doubts={doubts}
            canResolve
            emptyText="No questions on this subject yet."
          />
        </Panel>
      )}

      {tab === 3 && (
        <Panel
          title="Live classes"
          action={
            <Button
              component={Link}
              to={`/app/${role}/live-classes/create?subject=${id}`}
              variant="outlined"
              startIcon={<Add />}
            >
              Schedule class
            </Button>
          }
        >
          {liveClasses.length === 0 ? (
            <Empty>Nothing scheduled — put a session on the calendar.</Empty>
          ) : (
            liveClasses.map((lc) => (
              <Row
                key={lc._id}
                primary={lc.title}
                secondary={
                  lc.scheduledAt ? new Date(lc.scheduledAt).toLocaleString() : lc.status
                }
                right={
                  <Button
                    component={Link}
                    to={`/app/${role}/live-classes/${lc._id}`}
                    size="small"
                    variant="outlined"
                  >
                    Open
                  </Button>
                }
              />
            ))
          )}
        </Panel>
      )}

      {tab === 4 && (
        <>
          <StatCardRow>
            <StatCard
              value={subject?.ratingAverage ? subject.ratingAverage.toFixed(1) : "—"}
              label="Average rating"
              tone="warning"
              icon={<StarOutlineOutlined />}
            />
            <StatCard value={subject?.ratingCount ?? 0} label="Ratings" tone="info" />
            <StatCard value={reviews.length} label="Written reviews" tone="success" />
            <StatCard
              value={openQuestions}
              label="Open questions"
              tone={openQuestions > 0 ? "danger" : "success"}
            />
          </StatCardRow>

          <Box sx={{ mt: 2 }}>
            <Panel title="Reviews">
              {reviews.length === 0 ? (
                <Empty>No reviews yet — they show up here as students finish chapters.</Empty>
              ) : (
                reviews.map((r) => <ReviewRow key={r._id} review={r} />)
              )}
            </Panel>
          </Box>

          {subject?.updatedAt && (
            <Typography variant="caption" sx={{ display: "block", mt: 2 }}>
              Subject last updated {relativeTime(subject.updatedAt)}.
            </Typography>
          )}
        </>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: "1.05rem", fontWeight: 600 }}>Add chapter</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1, gridTemplateColumns: "1fr 1fr" }}>
          <TextField
            size="small"
            type="number"
            label="Chapter number"
            value={form.chapterNumber}
            onChange={(e) => setForm({ ...form, chapterNumber: e.target.value })}
          />
          <TextField
            size="small"
            label="Title"
            placeholder="Atomic Structure"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ gridColumn: "1 / -1" }}
          />
          <FormControlLabel
            sx={{ gridColumn: "1 / -1" }}
            control={
              <Switch
                checked={form.isFreePreview}
                onChange={(e) => setForm({ ...form, isFreePreview: e.target.checked })}
              />
            }
            label="Free preview (unlocks all its content)"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={creating || !form.title.trim()}
            onClick={addChapter}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </BreadcrumbLayout>
  );
};

export default SubjectDetailScreen;
