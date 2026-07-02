import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton,
} from "@mui/material";
import { CalculateOutlined, VisibilityOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import AppTable from "../../../../components/Shared/AppTable";
import { useTablePagination } from "../../../../hooks/useTablePagination";
import { useListPayoutsQuery, useComputePayoutsMutation } from "../../../../store/services/payoutApi";

const STATUS_COLOR = { pending: "default", processing: "info", paid: "success", failed: "error" };

const PayoutListScreen = () => {
  const navigate = useNavigate();
  const { currentPage, perPage, handlePageChange, handlePerRowsChange } = useTablePagination();
  const { data, isFetching, error } = useListPayoutsQuery({ page: currentPage, limit: perPage });
  const [computePayouts, { isLoading: computing }] = useComputePayoutsMutation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ periodStart: "", periodEnd: "", revenueSharePercent: 20 });

  const compute = async () => {
    try {
      const res = await computePayouts(form).unwrap();
      toast.success(res.message);
      setOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Compute failed");
    }
  };

  const columns = [
    { name: "Teacher", selector: (r) => r.teacher?.name, grow: 1.5 },
    { name: "Period", selector: (r) => `${new Date(r.periodStart).toLocaleDateString()} – ${new Date(r.periodEnd).toLocaleDateString()}`, grow: 1.5 },
    { name: "Revenue (NPR)", selector: (r) => r.attributedRevenue?.toLocaleString(), width: "130px" },
    { name: "Payout (NPR)", selector: (r) => r.payoutAmount?.toLocaleString(), width: "130px" },
    { name: "Status", cell: (r) => <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} />, width: "120px" },
    {
      name: "Actions",
      cell: (r) => (
        <IconButton size="small" onClick={() => navigate(`/app/admin/payouts/${r._id}`)}>
          <VisibilityOutlined fontSize="small" />
        </IconButton>
      ),
      right: true,
      width: "80px",
    },
  ];

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Payouts" }]}
      isBusy={isFetching}
      headerActions={
        <Button startIcon={<CalculateOutlined />} variant="contained" sx={{ bgcolor: "#1976d3" }} onClick={() => setOpen(true)}>
          Compute Payouts
        </Button>
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Compute Payouts</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField size="small" type="date" label="Period start" slotProps={{ inputLabel: { shrink: true } }} value={form.periodStart} onChange={(e) => setForm({ ...form, periodStart: e.target.value })} />
          <TextField size="small" type="date" label="Period end" slotProps={{ inputLabel: { shrink: true } }} value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
          <TextField size="small" type="number" label="Revenue share (%)" value={form.revenueSharePercent} onChange={(e) => setForm({ ...form, revenueSharePercent: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: "#1976d3" }} disabled={computing} onClick={compute}>Compute</Button>
        </DialogActions>
      </Dialog>
    </BreadcrumbLayout>
  );
};

export default PayoutListScreen;
