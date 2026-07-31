import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { tokens } from "../../../../theme";
import { useGetProgramsQuery } from "../../../../store/services/programApi";
import {
  useGetYearQuery,
  useCreateYearMutation,
  useUpdateYearMutation,
} from "../../../../store/services/yearApi";

// Module-level constant: a fresh object literal on every render would give the
// query a new cache key each time and refetch the program list forever.
const PROGRAM_QUERY_ARGS = { limit: 100 };

/** Mirrors buildSemesters() on the server so the form previews what it'll save. */
const semestersFor = (program, yearNumber) => {
  if (program?.structure !== "semester") return [];
  const perYear = program.semestersPerYear || 2;
  const first = (Number(yearNumber) - 1) * perYear + 1;
  return Array.from({ length: perYear }, (_, i) => ({
    semesterNumber: first + i,
    name: `Semester ${first + i}`,
  }));
};

const YearFormScreen = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // refetchOnMountOrArgChange: a program created moments ago on another screen
  // must be selectable here immediately, even if a stale list is still cached.
  const {
    data: programsRes,
    isLoading: programsLoading,
    isFetching: programsFetching,
  } = useGetProgramsQuery(PROGRAM_QUERY_ARGS, { refetchOnMountOrArgChange: true });
  const { data: existing } = useGetYearQuery(id, { skip: !isEdit });
  const [createYear, { isLoading: creating }] = useCreateYearMutation();
  const [updateYear, { isLoading: updating }] = useUpdateYearMutation();

  const programs = programsRes?.data ?? [];

  const [form, setForm] = useState({
    program: params.get("program") || "",
    yearNumber: 1,
    originalPrice: "",
    discountedPrice: "",
    isActive: false,
    description: "",
  });
  const [semesterNames, setSemesterNames] = useState({});

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
      setSemesterNames(
        Object.fromEntries((y.semesters ?? []).map((s) => [s.semesterNumber, s.name]))
      );
    }
  }, [existing]);

  const selectedProgram = useMemo(
    () => programs.find((p) => p._id === form.program) ?? existing?.data?.program,
    [programs, form.program, existing]
  );
  const semesters = semestersFor(selectedProgram, form.yearNumber);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      program: form.program,
      yearNumber: Number(form.yearNumber),
      description: form.description,
      isActive: form.isActive,
      bundlePrice: {
        originalPrice: Number(form.originalPrice),
        discountedPrice: Number(form.discountedPrice),
      },
      ...(semesters.length && {
        semesters: semesters.map((s) => ({
          semesterNumber: s.semesterNumber,
          name: semesterNames[s.semesterNumber] || s.name,
        })),
      }),
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

  const noPrograms = !programsLoading && programs.length === 0;

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        { title: "Catalog" },
        { title: "Years", path: "/app/admin/catalog/years" },
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
            select
            required
            size="small"
            label="Program"
            value={programs.some((p) => p._id === form.program) ? form.program : ""}
            onChange={set("program")}
            disabled={isEdit || programsLoading || noPrograms}
            helperText={
              noPrograms
                ? "No programs yet — create one first."
                : programsFetching && !programsLoading
                  ? "Refreshing…"
                  : " "
            }
            InputProps={
              programsLoading
                ? {
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mr: 2 }}>
                        <CircularProgress size={16} />
                      </InputAdornment>
                    ),
                  }
                : undefined
            }
          >
            {programs.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
                {p.structure === "semester" ? " · semester basis" : ""}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            required
            size="small"
            label="Year"
            value={form.yearNumber}
            onChange={set("yearNumber")}
          >
            {[1, 2, 3, 4].map((n) => (
              <MenuItem key={n} value={n}>{`${n}${["st", "nd", "rd", "th"][n - 1]} Year`}</MenuItem>
            ))}
          </TextField>

          <TextField
            required
            size="small"
            type="number"
            label="Bundle original price (NPR)"
            value={form.originalPrice}
            onChange={set("originalPrice")}
          />
          <TextField
            required
            size="small"
            type="number"
            label="Bundle discounted price (NPR)"
            value={form.discountedPrice}
            onChange={set("discountedPrice")}
          />

          {semesters.length > 0 && (
            <Box
              sx={{
                gridColumn: "1 / -1",
                border: `1px solid ${tokens.border}`,
                borderRadius: 2,
                p: 2,
                bgcolor: tokens.surfaceMuted,
              }}
            >
              <Typography variant="subtitle2">Semesters in this year</Typography>
              <Typography variant="caption" sx={{ display: "block", mb: 1.5 }}>
                {selectedProgram?.name} runs on a semester basis, so this year is created with{" "}
                {semesters.length} semesters. Subjects are filed under one of them.
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                }}
              >
                {semesters.map((s) => (
                  <TextField
                    key={s.semesterNumber}
                    size="small"
                    label={`Semester ${s.semesterNumber}`}
                    value={semesterNames[s.semesterNumber] ?? s.name}
                    onChange={(e) =>
                      setSemesterNames({ ...semesterNames, [s.semesterNumber]: e.target.value })
                    }
                  />
                ))}
              </Box>
            </Box>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
            }
            label="Active"
          />

          <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            {noPrograms ? (
              <Button component={Link} to="/app/admin/catalog/programs/create" variant="contained">
                Create a program first
              </Button>
            ) : (
              <Button type="submit" variant="contained">
                {isEdit ? "Update" : "Create"}
              </Button>
            )}
          </Box>
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default YearFormScreen;
