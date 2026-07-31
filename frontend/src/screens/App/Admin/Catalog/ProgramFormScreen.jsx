import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { tokens } from "../../../../theme";
import {
  useGetProgramQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
} from "../../../../store/services/programApi";

const empty = {
  name: "",
  code: "",
  description: "",
  structure: "yearly",
  semestersPerYear: 2,
  isActive: false,
};

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
      setForm({
        name: p.name,
        code: p.code || "",
        description: p.description || "",
        structure: p.structure || "yearly",
        semestersPerYear: p.semestersPerYear || 2,
        isActive: p.isActive,
      });
    }
  }, [existing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isSemester = form.structure === "semester";

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      semestersPerYear: isSemester ? Number(form.semestersPerYear) : undefined,
    };
    try {
      if (isEdit) await updateProgram({ id, ...body }).unwrap();
      else await createProgram(body).unwrap();
      toast.success(`Program ${isEdit ? "updated" : "created"}`);
      navigate("/app/admin/catalog/programs");
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        { title: "Catalog" },
        { title: "Programs", path: "/app/admin/catalog/programs" },
        { title: isEdit ? "Edit" : "New" },
      ]}
      isBusy={creating || updating}
    >
      <BreadcrumbLayout.Paper>
        <Box
          component="form"
          onSubmit={submit}
          sx={{ p: 3, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}
        >
          <TextField
            required
            size="small"
            label="Name (e.g. B.Sc CSIT)"
            value={form.name}
            onChange={set("name")}
          />
          <TextField size="small" label="Code" value={form.code} onChange={set("code")} />

          <TextField
            select
            required
            size="small"
            label="Structure"
            value={form.structure}
            onChange={set("structure")}
            helperText="Yearly programs sell a whole year; semester programs split each year up."
          >
            <MenuItem value="yearly">Yearly basis</MenuItem>
            <MenuItem value="semester">Semester basis</MenuItem>
          </TextField>

          {isSemester ? (
            <TextField
              select
              required
              size="small"
              label="Semesters per year"
              value={form.semestersPerYear}
              onChange={set("semestersPerYear")}
              helperText="Each year you add will be created with this many semesters."
            >
              {[1, 2, 3, 4].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Box />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
            }
            label="Active (visible to students)"
          />

          <TextField
            sx={{ gridColumn: "1 / -1" }}
            multiline
            minRows={2}
            size="small"
            label="Description"
            value={form.description}
            onChange={set("description")}
          />

          <Typography variant="caption" sx={{ gridColumn: "1 / -1", color: tokens.muted }}>
            Years aren&apos;t set here. Once this program is saved, add its years one at a time
            under Years — each year carries its own bundle price
            {isSemester ? " and its semesters." : "."}
          </Typography>

          <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {isEdit ? "Update" : "Create"}
            </Button>
          </Box>
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default ProgramFormScreen;
