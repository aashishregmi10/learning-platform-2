import { useState } from "react";
import { toast } from "react-toastify";
import { Box, Button, FormControlLabel, MenuItem, Switch, TextField, Typography } from "@mui/material";

import { useCreateContentMutation } from "../../../../store/services/contentApi";

const TYPES = ["video", "pdf", "note", "link"];
const NEEDS_FILE = ["video", "pdf", "audio"];

const ContentUploadForm = ({ chapterId, onDone }) => {
  const [createContent, { isLoading }] = useCreateContentMutation();
  const [form, setForm] = useState({ type: "note", title: "", order: "", isFree: false, noteContent: "", linkUrl: "" });
  const [file, setFile] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("chapter", chapterId);
    fd.append("type", form.type);
    fd.append("title", form.title);
    if (form.order) fd.append("order", form.order);
    fd.append("isFree", String(form.isFree));
    if (form.type === "note") fd.append("noteContent", form.noteContent);
    if (form.type === "link") fd.append("linkUrl", form.linkUrl);
    if (NEEDS_FILE.includes(form.type)) {
      if (!file) return toast.error("Please choose a file");
      fd.append("file", file);
    }
    try {
      await createContent(fd).unwrap();
      toast.success("Content added");
      onDone?.();
    } catch (err) {
      toast.error(err?.data?.message || "Upload failed");
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ p: 2, mb: 1, border: "1px solid #e0e0e0", borderRadius: 1, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
      <TextField select size="small" label="Type" value={form.type} onChange={set("type")}>
        {TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
      <TextField size="small" type="number" label="Order" value={form.order} onChange={set("order")} />
      <TextField required size="small" label="Title" value={form.title} onChange={set("title")} sx={{ gridColumn: "1 / -1" }} />

      {form.type === "note" && (
        <TextField size="small" multiline minRows={3} label="Note content" value={form.noteContent} onChange={set("noteContent")} sx={{ gridColumn: "1 / -1" }} />
      )}
      {form.type === "link" && (
        <TextField size="small" label="URL" value={form.linkUrl} onChange={set("linkUrl")} sx={{ gridColumn: "1 / -1" }} />
      )}
      {NEEDS_FILE.includes(form.type) && (
        <Box sx={{ gridColumn: "1 / -1" }}>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <Typography variant="caption" sx={{ display: "block", color: "#6b7280" }}>
            Uploaded privately to Cloudinary; students get short-lived signed URLs.
          </Typography>
        </Box>
      )}

      <FormControlLabel
        sx={{ gridColumn: "1 / -1" }}
        control={<Switch checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />}
        label="Free (accessible without purchase)"
      />
      <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onDone} disabled={isLoading}>Cancel</Button>
        <Button type="submit" variant="contained" sx={{ bgcolor: "#1976d3" }} disabled={isLoading}>
          {isLoading ? "Uploading…" : "Add"}
        </Button>
      </Box>
    </Box>
  );
};

export default ContentUploadForm;
