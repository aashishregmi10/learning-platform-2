import { Chip } from "@mui/material";
import MonitorTable from "./MonitorTable";

const STATUS_COLOR = { scheduled: "default", live: "success", ended: "info", cancelled: "error" };

const columns = [
  { name: "Title", selector: (r) => r.title, sortable: true, grow: 2 },
  { name: "Scheduled", selector: (r) => new Date(r.scheduledAt).toLocaleString(), width: "180px" },
  { name: "Duration", selector: (r) => `${r.duration} min`, width: "100px" },
  { name: "Status", cell: (r) => <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} />, width: "120px" },
  { name: "Attendees", selector: (r) => r.attendeeCount, width: "100px" },
];

const LiveClassesMonitorScreen = () => <MonitorTable resource="live" title="Live Classes" columns={columns} />;

export default LiveClassesMonitorScreen;
