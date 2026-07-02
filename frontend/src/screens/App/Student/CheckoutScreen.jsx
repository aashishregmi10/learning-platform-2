import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Divider, Paper, TextField, Typography } from "@mui/material";

import {
  useCreateOrderMutation,
  useValidateCouponMutation,
} from "../../../store/services/orderApi";
import {
  useInitiateEsewaMutation,
  useDevCompleteMutation,
  submitEsewaForm,
} from "../../../store/services/paymentApi";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const items = state?.items || [];

  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null); // { discount, total }
  const [createOrder, { isLoading: creating }] = useCreateOrderMutation();
  const [validateCoupon, { isLoading: validating }] = useValidateCouponMutation();
  const [initiateEsewa, { isLoading: initiating }] = useInitiateEsewaMutation();
  const [devComplete, { isLoading: simulating }] = useDevCompleteMutation();

  const cartPayload = items.map((i) => ({ itemType: i.itemType, subject: i.subject, year: i.year, program: i.program }));
  const subtotal = items.reduce((a, i) => a + (i.price || 0), 0);
  const total = preview ? preview.total : subtotal;

  if (!items.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Your cart is empty.</Typography>
        <Button onClick={() => navigate("/app/student")}>Back to catalog</Button>
      </Box>
    );
  }

  const applyCoupon = async () => {
    try {
      const res = await validateCoupon({ items: cartPayload, code }).unwrap();
      setPreview(res.data);
      toast.success(`Coupon applied — you save ${money(res.data.discount)}`);
    } catch (err) {
      setPreview(null);
      toast.error(err?.data?.message || "Invalid coupon");
    }
  };

  const payWithEsewa = async () => {
    try {
      const order = await createOrder({ items: cartPayload, ...(preview && { couponCode: code }) }).unwrap();
      const init = await initiateEsewa(order.data._id).unwrap();
      submitEsewaForm(init.data); // redirects to eSewa
    } catch (err) {
      toast.error(err?.data?.message || "Could not start payment");
    }
  };

  const simulatePay = async () => {
    try {
      const order = await createOrder({ items: cartPayload, ...(preview && { couponCode: code }) }).unwrap();
      await devComplete(order.data._id).unwrap();
      toast.success("Payment simulated — access granted");
      navigate(`/app/student/orders/${order.data._id}?status=paid`);
    } catch (err) {
      toast.error(err?.data?.message || "Simulation failed");
    }
  };

  const busy = creating || initiating || simulating;

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Checkout</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {items.map((i, idx) => (
          <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
            <span>{i.title}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{money(i.price)}</span>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", gap: 1, my: 1 }}>
          <TextField size="small" label="Coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} fullWidth />
          <Button variant="outlined" onClick={applyCoupon} disabled={!code || validating}>Apply</Button>
        </Box>
        {preview && (
          <Box sx={{ display: "flex", justifyContent: "space-between", color: "success.main" }}>
            <span>Coupon discount</span>
            <span>− {money(preview.discount)}</span>
          </Box>
        )}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
          <span>Total</span>
          <span>{money(total)}</span>
        </Box>

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Button variant="contained" size="large" disabled={busy} onClick={payWithEsewa}
            sx={{ bgcolor: "#60bb46", "&:hover": { bgcolor: "#4e9e39" } }}>
            Pay with eSewa
          </Button>
          <Button variant="text" size="small" disabled={busy} onClick={simulatePay}>
            Simulate payment (dev)
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CheckoutScreen;
