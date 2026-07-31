import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Autocomplete, Box, Button, TextField, Typography } from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import StatusChip from "../../../../components/Shared/StatusChip";
import { tokens } from "../../../../theme";
import { useGetTeacherQuery, useUpdateTeacherSubjectsMutation } from "../../../../store/services/userApi";
import { useGetSubjectsQuery } from "../../../../store/services/subjectApi";

const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={{ color: tokens.muted, textTransform: "uppercase" }}>{label}</Typography>
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
                <Typography variant="caption" sx={{ color: tokens.muted, textTransform: "uppercase" }}>Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip active={!!profile?.isApproved} labels={["Approved", "Pending approval"]} />
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Assigned subjects</Typography>
              <Typography variant="body2" sx={{ color: tokens.muted, mb: 2 }}>
                This teacher can only author content and run live classes for the subjects assigned here.
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={subjectOptions}
                loading={subjectsLoading}
                getOptionLabel={(s) => `${s.name} — ${s.year?.yearName ?? ""}`}
                isOptionEqualToValue={(a, b) => a._id === b._id}
                value={assignedSubjects}
                onChange={(_, value) => setAssignedSubjects(value)}
                renderInput={(params) => <TextField {...params} label="Subjects" placeholder="Select subjects to teach" />}
              />
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" disabled={saving} onClick={save}>
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
