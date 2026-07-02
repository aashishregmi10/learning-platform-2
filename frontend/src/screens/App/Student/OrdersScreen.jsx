import { Link } from "react-router-dom";
import { Box, Chip, Paper, Typography } from "@mui/material";

import { useGetMyOrdersQuery } from "../../../store/services/orderApi";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;
const STATUS_COLOR = { paid: "success", pending: "warning", failed: "error", refunded: "default" };
const fmt = (d) => new Date(d).toLocaleDateString();

const OrdersScreen = () => {
  const { data, isLoading } = useGetMyOrdersQuery({ limit: 50 });
  const orders = data?.data || [];

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>My orders</Typography>
      {isLoading && <Typography color="text.secondary">Loading…</Typography>}
      {!isLoading && orders.length === 0 && <Typography color="text.secondary">No orders yet.</Typography>}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {orders.map((o) => (
          <Paper key={o._id} variant="outlined" component={Link} to={`/app/student/orders/${o._id}`}
            sx={{ p: 2, textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography>{o.items.map((i) => i.title).join(", ")}</Typography>
              <Typography variant="caption" color="text.secondary">{o.invoiceNumber || o._id} · {fmt(o.createdAt)}</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontWeight: 600 }}>{money(o.totalAmount)}</Typography>
              <Chip size="small" label={o.status} color={STATUS_COLOR[o.status] || "default"} />
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default OrdersScreen;
