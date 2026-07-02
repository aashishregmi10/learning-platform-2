import { useState } from "react";
import { Chip, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import { useTablePagination } from "../../../../hooks/useTablePagination";
import { useGetActivityLogsQuery } from "../../../../store/services/activityLogApi";

const ACTIONS = [
  "create_teacher", "approve_teacher", "deactivate_user", "update_pricing", "create_subject", "update_subject",
  "delete_content", "refund_order", "create_coupon", "update_coupon", "issue_certificate", "process_payout",
  "hide_review", "upload_content", "update_content", "create_live_class", "update_live_class", "cancel_live_class", "resolve_doubt",
];

const ActivityLogScreen = () => {
  const [action, setAction] = useState("");
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();
  const { data, isFetching, error } = useGetActivityLogsQuery({ page: currentPage, limit: perPage, action: action || undefined });

  const columns = [
    { name: "When", selector: (r) => new Date(r.createdAt).toLocaleString(), width: "180px" },
    { name: "Actor", selector: (r) => `${r.actor?.name} (${r.actorRole})`, grow: 1.5 },
    { name: "Action", cell: (r) => <Chip size="small" label={r.action.replace(/_/g, " ")} />, width: "180px" },
    { name: "Target", selector: (r) => r.targetType || "—", width: "130px" },
    { name: "Details", selector: (r) => (r.changes ? JSON.stringify(r.changes.after ?? r.changes.before ?? {}).slice(0, 80) : r.description || "—"), grow: 2 },
  ];

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Activity Log" }]}
      isBusy={isFetching}
      headerActions={
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Action</InputLabel>
          <Select label="Action" value={action} onChange={(e) => setAction(e.target.value)}>
            <MenuItem value="">All actions</MenuItem>
            {ACTIONS.map((a) => <MenuItem key={a} value={a}>{a.replace(/_/g, " ")}</MenuItem>)}
          </Select>
        </FormControl>
      }
    >
      <BreadcrumbLayout.Error error={error} />
      <BreadcrumbLayout.Paper>
        <AppTable
          columns={columns}
          data={data?.data ?? []}
          progressPending={isFetching}
          paginationTotalRows={data?.totalItems ?? 0}
          paginationPerPage={perPage}
          paginationDefaultPage={currentPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
        />
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default ActivityLogScreen;
