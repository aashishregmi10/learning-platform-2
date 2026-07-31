import StatusBadge from "../../../../components/Shared/StatusBadge";
import StatusChip from "../../../../components/Shared/StatusChip";
import MonitorTable from "./MonitorTable";

const columns = [
  { name: "Title", selector: (r) => r.title, sortable: true, grow: 2 },
  { name: "Type", selector: (r) => r.type, width: "100px" },
  { name: "Published", cell: (r) => <StatusChip active={r.isPublished} />, width: "120px" },
  { name: "Views", selector: (r) => r.viewCount, width: "90px" },
  // uploading/processing → warning, ready → success, failed → danger
  { name: "Status", cell: (r) => <StatusBadge status={r.status} />, width: "120px" },
];

const ContentMonitorScreen = () => (
  <MonitorTable resource="content" title="Content" columns={columns} />
);

export default ContentMonitorScreen;
