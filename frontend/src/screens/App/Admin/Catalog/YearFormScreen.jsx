import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useGetProgramsQuery } from "../../../../store/services/programApi";
import {
  useGetYearQuery,
  useCreateYearMutation,
  useUpdateYearMutation,
} from "../../../../store/services/yearApi";

const YearFormScreen = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: programsRes } = useGetProgramsQuery({ limit: 100 });
  const { data: existing } = useGetYearQuery(id, { skip: !isEdit });
  const [createYear, { isLoading: creating }] = useCreateYearMutation();
  const [updateYear, { isLoading: updating }] = useUpdateYearMutation();

  const [form, setForm] = useState({
    program: params.get("program") || "",
    yearNumber: 1,
    originalPrice: "",
    discountedPrice: "",
    isActive: false,
    description: "",
  });

  useEffect(() => {
    if (existing?.data) {
      const y = existing.data;
      setForm({
        program: y.program?._id || y.program,
        yearNumber: y.yearNumber,
        originalPrice: y.bundlePrice?.originalPrice ?? "",
        discountedPrice: y.bundlePrice?.discountedPrice ?? "",
        isActive: y.isActive,
        description: y.description || "",
      });
    }
  }, [existing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      program: form.program,
      yearNumber: Number(form.yearNumber),
      description: form.description,
      isActive: form.isActive,
      bundlePrice: { originalPrice: Number(form.originalPrice), discountedPrice: Number(form.discountedPrice) },
    };
    try {
      if (isEdit) await updateYear({ id, ...body }).unwrap();
      else await createYear(body).unwrap();
      toast.success(`Year ${isEdit ? "updated" : "created"}`);
      navigate(`/app/admin/catalog/years?program=${form.program}`);
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Catalog" }, { title: "Years", path: "/app/admin/catalog/years" }, { title: isEdit ? "Edit" : "New" }]}
      isBusy={creating || updating}
    >
      <BreadcrumbLayout.Paper>
        <Box component="form" onSubmit={submit} sx={{ p: 3, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <TextField select required size="small" label="Program" value={form.program} onChange={set("program")} disabled={isEdit}>
            {(programsRes?.data ?? []).map((p) => (
              <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
            ))}
          </TextField>
          <TextField select required size="small" label="Year" value={form.yearNumber} onChange={set("yearNumber")}>
            {[1, 2, 3, 4].map((n) => (
              <MenuItem key={n} value={n}>{`${n}${["st", "nd", "rd", "th"][n - 1]} Year`}</MenuItem>
            ))}
          </TextField>
          <TextField required size="small" type="number" label="Bundle original price (NPR)" value={form.originalPrice} onChange={set("originalPrice")} />
          <TextField required size="small" type="number" label="Bundle discounted price (NPR)" value={form.discountedPrice} onChange={set("discountedPrice")} />
          <FormControlLabel
            control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
            label="Active"
          />
          <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#1976d3" }}>{isEdit ? "Update" : "Create"}</Button>
          </Box>
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default YearFormScreen;
