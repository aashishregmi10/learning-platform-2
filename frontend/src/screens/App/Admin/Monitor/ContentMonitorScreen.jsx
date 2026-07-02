import { Chip } from "@mui/material";
import MonitorTable from "./MonitorTable";

const columns = [
  { name: "Title", selector: (r) => r.title, sortable: true, grow: 2 },
  { name: "Type", selector: (r) => r.type, width: "100px" },
  { name: "Published", cell: (r) => <Chip size="small" label={r.isPublished ? "Published" : "Draft"} color={r.isPublished ? "success" : "default"} />, width: "120px" },
  { name: "Views", selector: (r) => r.viewCount, width: "90px" },
  { name: "Status", selector: (r) => r.status, width: "100px" },
];

const ContentMonitorScreen = () => <MonitorTable resource="content" title="Content" columns={columns} />;

export default ContentMonitorScreen;
