import { Link, useParams, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";

import { useGetOrderQuery } from "../../../store/services/orderApi";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;
const STATUS_COLOR = { paid: "success", pending: "warning", failed: "error", refunded: "default", cancelled: "default" };

const OrderDetailScreen = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const returnStatus = params.get("status");
  const { data, isLoading } = useGetOrderQuery(id, { pollingInterval: returnStatus === "paid" ? 2000 : 0 });

  const order = data?.data;
  if (isLoading) return <Box sx={{ p: 3 }}>Loading order…</Box>;
  if (!order) return <Box sx={{ p: 3 }}>Order not found.</Box>;

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      {returnStatus === "paid" && order.status === "paid" && (
        <Alert severity="success" sx={{ mb: 2 }}>Payment successful — your access is unlocked.</Alert>
      )}
      {returnStatus === "failed" && (
        <Alert severity="error" sx={{ mb: 2 }}>Payment was not completed. You can try again from the catalog.</Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6">Order</Typography>
          <Chip size="small" label={order.status} color={STATUS_COLOR[order.status] || "default"} />
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {order.invoiceNumber || order._id}
        </Typography>

        {order.items.map((i, idx) => (
          <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
            <span>{i.title}</span>
            <span>{money(i.discountedPrice)}</span>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
        {order.couponDiscount > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", color: "success.main" }}>
            <span>Coupon</span><span>− {money(order.couponDiscount)}</span>
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>Total</span><span>{money(order.totalAmount)}</span>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button component={Link} to="/app/student" variant="contained">Go to catalog</Button>
          <Button component={Link} to="/app/student/subscriptions" variant="outlined">My subscriptions</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderDetailScreen;
