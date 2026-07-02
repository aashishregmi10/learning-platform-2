import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Switch, TextField, Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useGetSubjectQuery } from "../../../../store/services/subjectApi";
import { useGetChaptersQuery, useCreateChapterMutation } from "../../../../store/services/chapterApi";
import { useGetSubjectReviewsQuery, useRespondToReviewMutation } from "../../../../store/services/reviewApi";
import ChapterPanel from "./ChapterPanel";

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
    <Box sx={{ borderTop: "1px solid #e0e0e0", py: 1.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {review.student?.name} — {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
      </Typography>
      {review.comment && <Typography variant="body2" sx={{ color: "#6b7280" }}>{review.comment}</Typography>}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <TextField size="small" fullWidth placeholder="Respond to this review…" value={text} onChange={(e) => setText(e.target.value)} />
        <Button size="small" variant="outlined" disabled={isLoading || !text} onClick={respond}>Respond</Button>
      </Box>
    </Box>
  );
};

const SubjectDetailScreen = () => {
  const { id } = useParams();
  const { data: subjectRes, isLoading, error } = useGetSubjectQuery(id);
  const { data: chaptersRes } = useGetChaptersQuery({ subject: id });
  const [createChapter, { isLoading: creating }] = useCreateChapterMutation();
  const { data: reviewsRes } = useGetSubjectReviewsQuery({ id }, { skip: !id });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chapterNumber: "", title: "", isFreePreview: false });

  const subject = subjectRes?.data;
  const chapters = chaptersRes?.data ?? [];
  const reviews = reviewsRes?.data?.reviews ?? [];

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
      setForm({ chapterNumber: "", title: "", isFreePreview: false });
    } catch (err) {
      toast.error(err?.data?.message || "Could not add chapter");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Catalog" }, { title: "Subjects", path: "/app/admin/catalog/subjects" }, { title: subject?.name || "Subject" }]}
      isBusy={isLoading}
      headerActions={
        <Button startIcon={<Add />} variant="contained" sx={{ bgcolor: "#1976d3" }} onClick={() => setOpen(true)}>
          Add Chapter
        </Button>
      }
    >
      <BreadcrumbLayout.Error error={error} />

      {subject && (
        <BreadcrumbLayout.Paper>
          <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="h6">{subject.name}</Typography>
            <Chip size="small" label={subject.isActive ? "Active" : "Draft"} color={subject.isActive ? "success" : "default"} />
            <Chip size="small" variant="outlined" label={`NPR ${Number(subject.pricing?.discountedPrice || 0).toLocaleString()}`} />
            <Chip size="small" variant="outlined" label={`${subject.totalChapters} chapters`} />
          </Box>
        </BreadcrumbLayout.Paper>
      )}

      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {chapters.length === 0 && (
          <Typography sx={{ color: "#6b7280", p: 2 }}>No chapters yet — add the first one.</Typography>
        )}
        {chapters.map((ch) => (
          <ChapterPanel key={ch._id} chapter={ch} />
        ))}
      </Box>

      {reviews.length > 0 && (
        <BreadcrumbLayout.Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Reviews</Typography>
          {reviews.map((r) => <ReviewRow key={r._id} review={r} />)}
        </BreadcrumbLayout.Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Chapter</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1, gridTemplateColumns: "1fr 1fr" }}>
          <TextField size="small" type="number" label="Chapter number" value={form.chapterNumber} onChange={(e) => setForm({ ...form, chapterNumber: e.target.value })} />
          <TextField size="small" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} sx={{ gridColumn: "1 / -1" }} />
          <FormControlLabel
            sx={{ gridColumn: "1 / -1" }}
            control={<Switch checked={form.isFreePreview} onChange={(e) => setForm({ ...form, isFreePreview: e.target.checked })} />}
            label="Free preview (unlocks all its content)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: "#1976d3" }} disabled={creating} onClick={addChapter}>Add</Button>
        </DialogActions>
      </Dialog>
    </BreadcrumbLayout>
  );
};

export default SubjectDetailScreen;
