import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Button, Chip, MenuItem, Select, FormControl, InputLabel, TextField, Typography,
} from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useGetPayoutQuery, useUpdatePayoutMutation } from "../../../../store/services/payoutApi";

const STATUS_COLOR = { pending: "default", processing: "info", paid: "success", failed: "error" };

const PayoutDetailScreen = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetPayoutQuery(id);
  const [updatePayout, { isLoading: saving }] = useUpdatePayoutMutation();
  const payout = data?.data;

  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (payout) {
      setStatus(payout.status);
      setNotes(payout.notes || "");
    }
  }, [payout]);

  const save = async () => {
    try {
      await updatePayout({ id, status, notes }).unwrap();
      toast.success("Payout updated");
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Payouts", path: "/app/admin/payouts" }, { title: "Detail" }]} isBusy={isLoading}>
      <BreadcrumbLayout.Error error={error} />
      {payout && (
        <BreadcrumbLayout.Paper>
          <Box sx={{ p: 3, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Typography sx={{ gridColumn: "1 / -1" }} variant="h6">{payout.teacher?.name}</Typography>
            <Typography variant="body2">Period: {new Date(payout.periodStart).toLocaleDateString()} – {new Date(payout.periodEnd).toLocaleDateString()}</Typography>
            <Typography variant="body2">Current status: <Chip size="small" label={payout.status} color={STATUS_COLOR[payout.status]} /></Typography>
            <Typography variant="body2">Attributed subscriptions: {payout.attributedSubscriptions}</Typography>
            <Typography variant="body2">Attributed revenue: NPR {payout.attributedRevenue?.toLocaleString()}</Typography>
            <Typography variant="body2">Revenue share: {payout.revenueSharePercent}%</Typography>
            <Typography variant="body2">Payout amount: NPR {payout.payoutAmount?.toLocaleString()}</Typography>
            {payout.paidAt && <Typography variant="body2">Paid at: {new Date(payout.paidAt).toLocaleString()}</Typography>}

            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

            <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" sx={{ bgcolor: "#1976d3" }} disabled={saving} onClick={save}>Save</Button>
            </Box>
          </Box>
        </BreadcrumbLayout.Paper>
      )}
    </BreadcrumbLayout>
  );
};

export default PayoutDetailScreen;
