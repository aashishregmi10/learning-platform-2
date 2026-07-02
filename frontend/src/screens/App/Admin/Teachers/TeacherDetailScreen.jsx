import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Autocomplete, Box, Button, Chip, TextField, Typography } from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useGetTeacherQuery, useUpdateTeacherSubjectsMutation } from "../../../../store/services/userApi";
import { useGetSubjectsQuery } from "../../../../store/services/subjectApi";

const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase" }}>{label}</Typography>
    <Typography>{value || "—"}</Typography>
  </Box>
);

const TeacherDetailScreen = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetTeacherQuery(id);
  const { data: subjectsRes, isLoading: subjectsLoading } = useGetSubjectsQuery({ limit: 500 });
  const [updateSubjects, { isLoading: saving }] = useUpdateTeacherSubjectsMutation();
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  const user = data?.data?.user;
  const profile = data?.data?.teacherProfile;
  const subjectOptions = subjectsRes?.data ?? [];

  useEffect(() => {
    if (profile?.assignedSubjects) setAssignedSubjects(profile.assignedSubjects);
  }, [profile]);

  const save = async () => {
    try {
      await updateSubjects({ id, assignedSubjects: assignedSubjects.map((s) => s._id) }).unwrap();
      toast.success("Assigned subjects updated");
    } catch (err) {
      toast.error(err?.data?.message || "Could not save assignments");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        { title: "Teachers", path: "/app/admin/teachers" },
        { title: user?.name || "Teacher" },
      ]}
      isBusy={isLoading}
    >
      <BreadcrumbLayout.Error error={error} />
      {user && (
        <BreadcrumbLayout.Paper>
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
              <Field label="Name" value={user.name} />
              <Field label="Email" value={user.email} />
              <Field label="Qualification" value={profile?.qualification} />
              <Field label="Specialization" value={profile?.specialization} />
              <Box>
                <Typography variant="caption" sx={{ color: "#6b7280", textTransform: "uppercase" }}>Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip size="small" label={profile?.isApproved ? "Approved" : "Pending approval"} color={profile?.isApproved ? "success" : "warning"} />
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Assigned subjects</Typography>
              <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
                This teacher can only author content and run live classes for the subjects assigned here.
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={subjectOptions}
                loading={subjectsLoading}
                getOptionLabel={(s) => s.name}
                isOptionEqualToValue={(a, b) => a._id === b._id}
                value={assignedSubjects}
                onChange={(_, value) => setAssignedSubjects(value)}
                renderInput={(params) => <TextField {...params} label="Subjects" placeholder="Select subjects to teach" />}
              />
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" disabled={saving} onClick={save} sx={{ bgcolor: "#1976d3" }}>
                  {saving ? "Saving…" : "Save assignments"}
                </Button>
              </Box>
            </Box>
          </Box>
        </BreadcrumbLayout.Paper>
      )}
    </BreadcrumbLayout>
  );
};

export default TeacherDetailScreen;
