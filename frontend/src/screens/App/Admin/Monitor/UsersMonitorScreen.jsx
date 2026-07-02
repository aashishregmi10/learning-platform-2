import { Chip } from "@mui/material";
import MonitorTable from "./MonitorTable";

const columns = [
  { name: "Name", selector: (r) => r.name, sortable: true, grow: 2 },
  { name: "Email", selector: (r) => r.email, grow: 2 },
  { name: "Role", cell: (r) => <Chip size="small" label={r.role} />, width: "110px" },
  { name: "Active", cell: (r) => <Chip size="small" label={r.isActive ? "Active" : "Inactive"} color={r.isActive ? "success" : "default"} />, width: "110px" },
  { name: "Verified", selector: (r) => (r.isVerified ? "✓" : "—"), width: "90px" },
  { name: "Last login", selector: (r) => (r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString() : "never"), width: "120px" },
];

const UsersMonitorScreen = () => <MonitorTable resource="users" title="Users" columns={columns} />;

export default UsersMonitorScreen;
