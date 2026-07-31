import StatusChip from "../../../../components/Shared/StatusChip";
import MonitorTable from "./MonitorTable";

const columns = [
  { name: "Name", selector: (r) => r.name, sortable: true, grow: 2 },
  { name: "Price (NPR)", selector: (r) => r.pricing?.discountedPrice, width: "120px" },
  { name: "Chapters", selector: (r) => r.totalChapters, width: "100px" },
  { name: "Rating", selector: (r) => `${r.ratingAverage || 0} (${r.ratingCount || 0})`, width: "110px" },
  { name: "Active", cell: (r) => <StatusChip active={r.isActive} />, width: "110px" },
];

const SubjectsMonitorScreen = () => (
  <MonitorTable resource="subjects" title="Subjects" columns={columns} />
);

export default SubjectsMonitorScreen;
