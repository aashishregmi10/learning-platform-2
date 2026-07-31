import StatusBadge from "../../../../components/Shared/StatusBadge";
import MonitorTable from "./MonitorTable";

const columns = [
  { name: "Title", selector: (r) => r.title, sortable: true, grow: 2 },
  { name: "Scheduled", selector: (r) => new Date(r.scheduledAt).toLocaleString(), width: "180px" },
  { name: "Duration", selector: (r) => `${r.duration} min`, width: "100px" },
  { name: "Status", cell: (r) => <StatusBadge status={r.status} />, width: "120px" },
  { name: "Attendees", selector: (r) => r.attendeeCount, width: "100px" },
];

const LiveClassesMonitorScreen = () => (
  <MonitorTable resource="live" title="Live Classes" columns={columns} />
);

export default LiveClassesMonitorScreen;
