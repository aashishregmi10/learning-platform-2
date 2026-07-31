import { Chip } from "@mui/material";

import StatusChip from "../../../../components/Shared/StatusChip";
import MonitorTable from "./MonitorTable";

const columns = [
  { name: "Name", selector: (r) => r.name, sortable: true, grow: 2 },
  { name: "Email", selector: (r) => r.email, grow: 2 },
  // Role is a category, not a judgement — stays an outlined grey chip.
  { name: "Role", cell: (r) => <Chip size="small" variant="outlined" label={r.role} />, width: "110px" },
  {
    name: "Active",
    // A deactivated account is a problem, not a draft — hence danger.
    cell: (r) => <StatusChip active={r.isActive} labels={["Active", "Inactive"]} offRole="danger" />,
    width: "110px",
  },
  { name: "Verified", selector: (r) => (r.isVerified ? "✓" : "—"), width: "90px" },
  {
    name: "Last login",
    selector: (r) => (r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString() : "never"),
    width: "120px",
  },
];

const UsersMonitorScreen = () => <MonitorTable resource="users" title="Users" columns={columns} />;

export default UsersMonitorScreen;
