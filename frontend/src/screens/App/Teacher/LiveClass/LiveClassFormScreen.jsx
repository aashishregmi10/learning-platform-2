import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Button, MenuItem, Select, FormControl, InputLabel, TextField,
} from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useAuth } from "../../../../hooks/useAuth";
import { useGetSubjectsQuery } from "../../../../store/services/subjectApi";
import {
  useGetLiveClassQuery,
  useCreateLiveClassMutation,
  useUpdateLiveClassMutation,
} from "../../../../store/services/liveClassApi";

const empty = {
  subject: "", title: "", description: "", scheduledAt: "", duration: 60,
  audience: "paid", meetingLink: "", meetingPassword: "",
};

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const LiveClassFormScreen = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: subjectsRes } = useGetSubjectsQuery({ limit: 100 });
  const { data: existing } = useGetLiveClassQuery(id, { skip: !isEdit });
  const [createLiveClass, { isLoading: creating }] = useCreateLiveClassMutation();
  const [updateLiveClass, { isLoading: updating }] = useUpdateLiveClassMutation();

  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (existing?.data) {
      const c = existing.data;
      setForm({
        subject: c.subject?._id || c.subject,
        title: c.title,
        description: c.description || "",
        scheduledAt: toLocalInput(c.scheduledAt),
        duration: c.duration,
        audience: c.audience,
        meetingLink: c.meetingLink || "",
        meetingPassword: c.meetingPassword || "",
      });
    }
  }, [existing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const backTo = () => navigate(`/app/${role}/live-classes`);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, duration: Number(form.duration), scheduledAt: new Date(form.scheduledAt).toISOString() };
    try {
      if (isEdit) await updateLiveClass({ id, ...payload }).unwrap();
      else await createLiveClass(payload).unwrap();
      toast.success(`Live class ${isEdit ? "updated" : "scheduled"}`);
      backTo();
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Live Classes", path: `/app/${role}/live-classes` }, { title: isEdit ? "Edit" : "New" }]}
      isBusy={creating || updating}
    >
      <BreadcrumbLayout.Paper>
        <Box component="form" onSubmit={submit} sx={{ p: 3, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <FormControl size="small" required>
            <InputLabel>Subject</InputLabel>
            <Select label="Subject" value={form.subject} onChange={set("subject")}>
              {(subjectsRes?.data ?? []).map((s) => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField required size="small" label="Title" value={form.title} onChange={set("title")} />
          <TextField
            required size="small" type="datetime-local" label="Scheduled at" value={form.scheduledAt}
            onChange={set("scheduledAt")} slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField required size="small" type="number" label="Duration (minutes)" value={form.duration} onChange={set("duration")} />
          <FormControl size="small">
            <InputLabel>Audience</InputLabel>
            <Select label="Audience" value={form.audience} onChange={set("audience")}>
              <MenuItem value="paid">Paid (entitled students)</MenuItem>
              <MenuItem value="free">Free (open to all)</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Meeting link" value={form.meetingLink} onChange={set("meetingLink")} placeholder="https://meet.google.com/..." />
          <TextField size="small" label="Meeting password" value={form.meetingPassword} onChange={set("meetingPassword")} />
          <TextField sx={{ gridColumn: "1 / -1" }} multiline minRows={2} size="small" label="Description" value={form.description} onChange={set("description")} />
          <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={backTo}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#1976d3" }}>{isEdit ? "Update" : "Schedule"}</Button>
          </Box>
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default LiveClassFormScreen;
