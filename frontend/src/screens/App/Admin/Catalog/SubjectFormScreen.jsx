import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useGetYearsQuery } from "../../../../store/services/yearApi";
import {
  useGetSubjectQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
} from "../../../../store/services/subjectApi";

const CATEGORIES = ["Core", "Elective", "Practical", "Ability Enhancement"];

const SubjectFormScreen = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: yearsRes } = useGetYearsQuery({ limit: 100 });
  const { data: existing } = useGetSubjectQuery(id, { skip: !isEdit });
  const [createSubject, { isLoading: creating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: updating }] = useUpdateSubjectMutation();

  const [form, setForm] = useState({
    year: params.get("year") || "",
    name: "",
    subjectCode: "",
    category: "Core",
    originalPrice: "",
    discountedPrice: "",
    isActive: false,
    description: "",
  });

  useEffect(() => {
    if (existing?.data) {
      const s = existing.data;
      setForm({
        year: s.year?._id || s.year,
        name: s.name,
        subjectCode: s.subjectCode || "",
        category: s.category,
        originalPrice: s.pricing?.originalPrice ?? "",
        discountedPrice: s.pricing?.discountedPrice ?? "",
        isActive: s.isActive,
        description: s.description || "",
      });
    }
  }, [existing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      name: form.name,
      subjectCode: form.subjectCode,
      category: form.category,
      description: form.description,
      isActive: form.isActive,
      pricing: { originalPrice: Number(form.originalPrice), discountedPrice: Number(form.discountedPrice) },
    };
    try {
      if (isEdit) await updateSubject({ id, ...body }).unwrap();
      else await createSubject({ year: form.year, ...body }).unwrap();
      toast.success(`Subject ${isEdit ? "updated" : "created"}`);
      navigate(`/app/admin/catalog/subjects?year=${form.year}`);
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Catalog" }, { title: "Subjects", path: "/app/admin/catalog/subjects" }, { title: isEdit ? "Edit" : "New" }]}
      isBusy={creating || updating}
    >
      <BreadcrumbLayout.Paper>
        <Box component="form" onSubmit={submit} sx={{ p: 3, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <TextField select required size="small" label="Year" value={form.year} onChange={set("year")} disabled={isEdit}>
            {(yearsRes?.data ?? []).map((y) => (
              <MenuItem key={y._id} value={y._id}>{`${y.program?.name || ""} · ${y.yearName}`}</MenuItem>
            ))}
          </TextField>
          <TextField required size="small" label="Name" value={form.name} onChange={set("name")} />
          <TextField size="small" label="Subject code" value={form.subjectCode} onChange={set("subjectCode")} />
          <TextField select size="small" label="Category" value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField required size="small" type="number" label="Original price (NPR)" value={form.originalPrice} onChange={set("originalPrice")} />
          <TextField required size="small" type="number" label="Discounted price (NPR)" value={form.discountedPrice} onChange={set("discountedPrice")} />
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

export default SubjectFormScreen;
