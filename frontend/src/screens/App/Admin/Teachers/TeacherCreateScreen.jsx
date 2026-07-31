import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Autocomplete, Box, Button, TextField } from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useCreateTeacherMutation } from "../../../../store/services/userApi";
import { useGetSubjectsQuery } from "../../../../store/services/subjectApi";

const empty = {
  firstName: "",
  middleName: "",
  surname: "",
  email: "",
  password: "",
  qualification: "",
  specialization: "",
};

const TeacherCreateScreen = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [createTeacher, { isLoading }] = useCreateTeacherMutation();
  const { data: subjectsRes, isLoading: subjectsLoading } = useGetSubjectsQuery({ limit: 500 });
  const subjectOptions = subjectsRes?.data ?? [];

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTeacher({ ...form, assignedSubjects: assignedSubjects.map((s) => s._id) }).unwrap();
      toast.success("Teacher created");
      navigate("/app/admin/teachers");
    } catch (err) {
      toast.error(err?.data?.message || "Could not create teacher");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        { title: "Teachers", path: "/app/admin/teachers" },
        { title: "New Teacher" },
      ]}
      isBusy={isLoading}
    >
      <BreadcrumbLayout.Paper>
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            <TextField fullWidth required size="small" label="First name" value={form.firstName} onChange={set("firstName")} />
            <TextField fullWidth size="small" label="Middle name (optional)" value={form.middleName} onChange={set("middleName")} />
            <TextField fullWidth required size="small" label="Surname" value={form.surname} onChange={set("surname")} />
            <TextField fullWidth required size="small" label="Email" type="email" value={form.email} onChange={set("email")} />
            <TextField fullWidth required size="small" label="Temp Password" value={form.password} onChange={set("password")} />
            <TextField fullWidth size="small" label="Qualification" value={form.qualification} onChange={set("qualification")} />
            <TextField fullWidth size="small" label="Specialization" value={form.specialization} onChange={set("specialization")} />
            <Autocomplete
              multiple
              sx={{ gridColumn: "1 / -1" }}
              size="small"
              options={subjectOptions}
              loading={subjectsLoading}
              getOptionLabel={(s) => `${s.name} — ${s.year?.yearName ?? ""}`}
              isOptionEqualToValue={(a, b) => a._id === b._id}
              value={assignedSubjects}
              onChange={(_, value) => setAssignedSubjects(value)}
              renderInput={(params) => <TextField {...params} label="Assigned subjects" placeholder="Select subjects to teach" />}
            />
          </Box>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => navigate(-1)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              Create
            </Button>
          </Box>
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default TeacherCreateScreen;
