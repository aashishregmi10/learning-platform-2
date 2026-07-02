import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, FormControlLabel, Switch, TextField } from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import {
  useGetProgramQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
} from "../../../../store/services/programApi";

const empty = { name: "", code: "", description: "", durationYears: 4, isActive: false };

const ProgramFormScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existing } = useGetProgramQuery(id, { skip: !isEdit });
  const [createProgram, { isLoading: creating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: updating }] = useUpdateProgramMutation();

  const [form, setForm] = useState(empty);
  useEffect(() => {
    if (existing?.data) {
      const p = existing.data;
      setForm({ name: p.name, code: p.code || "", description: p.description || "", durationYears: p.durationYears, isActive: p.isActive });
    }
  }, [existing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await updateProgram({ id, ...form }).unwrap();
      else await createProgram(form).unwrap();
      toast.success(`Program ${isEdit ? "updated" : "created"}`);
      navigate("/app/admin/catalog/programs");
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Catalog" }, { title: "Programs", path: "/app/admin/catalog/programs" }, { title: isEdit ? "Edit" : "New" }]}
      isBusy={creating || updating}
    >
      <BreadcrumbLayout.Paper>
        <Box component="form" onSubmit={submit} sx={{ p: 3, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <TextField required size="small" label="Name (e.g. B.Sc CSIT)" value={form.name} onChange={set("name")} />
          <TextField size="small" label="Code" value={form.code} onChange={set("code")} />
          <TextField size="small" type="number" label="Duration (years)" value={form.durationYears} onChange={set("durationYears")} />
          <FormControlLabel
            control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
            label="Active (visible to students)"
          />
          <TextField sx={{ gridColumn: "1 / -1" }} multiline minRows={2} size="small" label="Description" value={form.description} onChange={set("description")} />
          <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#1976d3" }}>{isEdit ? "Update" : "Create"}</Button>
          </Box>
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default ProgramFormScreen;
