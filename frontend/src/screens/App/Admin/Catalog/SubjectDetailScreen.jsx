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
import ChapterPanel from "./ChapterPanel";

const SubjectDetailScreen = () => {
  const { id } = useParams();
  const { data: subjectRes, isLoading, error } = useGetSubjectQuery(id);
  const { data: chaptersRes } = useGetChaptersQuery({ subject: id });
  const [createChapter, { isLoading: creating }] = useCreateChapterMutation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chapterNumber: "", title: "", isFreePreview: false });

  const subject = subjectRes?.data;
  const chapters = chaptersRes?.data ?? [];

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
