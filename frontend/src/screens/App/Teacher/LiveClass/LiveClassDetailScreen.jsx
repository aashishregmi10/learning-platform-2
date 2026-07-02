import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import { EditOutlined, PlayArrowOutlined, StopOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import CustomTabs from "../../../../components/Shared/CustomTabs";
import CustomTabPanel from "../../../../components/Shared/CustomTabPanel";
import { useAuth } from "../../../../hooks/useAuth";
import {
  useGetLiveClassQuery,
  useListAttendanceQuery,
  useStartLiveClassMutation,
  useEndLiveClassMutation,
} from "../../../../store/services/liveClassApi";
import { useGetLiveClassDoubtsQuery } from "../../../../store/services/doubtApi";
import DoubtThread from "../../../../components/Student/DoubtThread";
import DoubtComposer from "../../../../components/Student/DoubtComposer";

const STATUS_COLOR = { scheduled: "default", live: "success", ended: "info", cancelled: "error" };

const LiveClassDetailScreen = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const activeTab = params.get("tab") || "overview";

  const { data, isLoading, error } = useGetLiveClassQuery(id);
  const { data: attendanceRes } = useListAttendanceQuery(id, { skip: activeTab !== "attendance" });
  const { data: doubtsRes } = useGetLiveClassDoubtsQuery(id, { skip: activeTab !== "doubts" });
  const [startLiveClass] = useStartLiveClassMutation();
  const [endLiveClass] = useEndLiveClassMutation();

  const liveClass = data?.data;
  const attendance = attendanceRes?.data ?? [];

  const act = async (fn, label) => {
    try {
      await fn(id).unwrap();
      toast.success(label);
    } catch (err) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Live Classes", path: `/app/${role}/live-classes` }, { title: liveClass?.title || "Detail" }]}
      isBusy={isLoading}
      headerActions={
        liveClass && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" startIcon={<EditOutlined />} onClick={() => navigate(`/app/${role}/live-classes/${id}/edit`)}>
              Edit
            </Button>
            {liveClass.status === "scheduled" && (
              <Button size="small" startIcon={<PlayArrowOutlined />} variant="contained" sx={{ bgcolor: "#2D5A3D" }} onClick={() => act(startLiveClass, "Class started")}>
                Start
              </Button>
            )}
            {liveClass.status === "live" && (
              <Button size="small" startIcon={<StopOutlined />} variant="contained" color="error" onClick={() => act(endLiveClass, "Class ended")}>
                End
              </Button>
            )}
          </Box>
        )
      }
    >
      <BreadcrumbLayout.Error error={error} />

      {liveClass && (
        <>
          <BreadcrumbLayout.Paper>
            <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <Typography variant="h6">{liveClass.title}</Typography>
              <Chip size="small" label={liveClass.status} color={STATUS_COLOR[liveClass.status]} />
              <Chip size="small" variant="outlined" label={liveClass.subject?.name} />
              <Chip size="small" variant="outlined" label={new Date(liveClass.scheduledAt).toLocaleString()} />
              <Chip size="small" variant="outlined" label={`${liveClass.duration} min`} />
              <Chip size="small" variant="outlined" label={`${liveClass.attendeeCount} attendee(s)`} />
            </Box>
          </BreadcrumbLayout.Paper>

          <CustomTabs
            activeTab={activeTab}
            tabs={[{ label: "Overview", value: "overview" }, { label: "Attendance", value: "attendance" }, { label: "Doubts", value: "doubts" }]}
          />

          <CustomTabPanel activeTab={activeTab} value="overview">
            <BreadcrumbLayout.Paper>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: "#6b7280", mb: 1 }}>{liveClass.description || "No description."}</Typography>
                <Typography variant="body2">Audience: {liveClass.audience}</Typography>
                <Typography variant="body2">Meeting link: {liveClass.meetingLink || "—"}</Typography>
              </Box>
            </BreadcrumbLayout.Paper>
          </CustomTabPanel>

          <CustomTabPanel activeTab={activeTab} value="attendance">
            <BreadcrumbLayout.Paper>
              <List dense>
                {attendance.length === 0 && (
                  <Typography sx={{ p: 2, color: "#6b7280" }}>No attendance recorded yet.</Typography>
                )}
                {attendance.map((a) => (
                  <ListItem key={a._id}>
                    <ListItemText
                      primary={a.student?.name || a.student?.email}
                      secondary={`${a.totalDurationMinutes} min · ${a.sessionCount} session(s) · joined ${new Date(a.joinedAt).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </BreadcrumbLayout.Paper>
          </CustomTabPanel>

          <CustomTabPanel activeTab={activeTab} value="doubts">
            <BreadcrumbLayout.Paper>
              <Box sx={{ p: 2 }}>
                <DoubtThread doubts={doubtsRes?.data} liveClass={id} canResolve />
                <Box sx={{ mt: 1 }}>
                  <DoubtComposer liveClass={id} />
                </Box>
              </Box>
            </BreadcrumbLayout.Paper>
          </CustomTabPanel>
        </>
      )}
    </BreadcrumbLayout>
  );
};

export default LiveClassDetailScreen;
