import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, MenuItem, TextField } from "@mui/material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useCreateCouponMutation } from "../../../../store/services/couponApi";

const CouponFormScreen = () => {
  const navigate = useNavigate();
  const [createCoupon, { isLoading }] = useCreateCouponMutation();
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    appliesTo: "all",
    minOrderAmount: "",
    maxRedemptions: "",
    perUserLimit: 1,
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createCoupon({
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        appliesTo: form.appliesTo,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        perUserLimit: Number(form.perUserLimit) || 1,
      }).unwrap();
      toast.success("Coupon created");
      navigate("/app/admin/coupons");
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Coupons", path: "/app/admin/coupons" }, { title: "New" }]} isBusy={isLoading}>
      <BreadcrumbLayout.Paper>
        <Box component="form" onSubmit={submit} sx={{ p: 3, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <TextField required size="small" label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <TextField select size="small" label="Discount type" value={form.discountType} onChange={set("discountType")}>
            <MenuItem value="percentage">Percentage</MenuItem>
            <MenuItem value="flat">Flat (NPR)</MenuItem>
          </TextField>
          <TextField required size="small" type="number" label="Discount value" value={form.discountValue} onChange={set("discountValue")} />
          <TextField select size="small" label="Applies to" value={form.appliesTo} onChange={set("appliesTo")}>
            {["all", "subject", "year", "program"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
          <TextField size="small" type="number" label="Min order (NPR)" value={form.minOrderAmount} onChange={set("minOrderAmount")} />
          <TextField size="small" type="number" label="Max redemptions (blank = ∞)" value={form.maxRedemptions} onChange={set("maxRedemptions")} />
          <TextField size="small" type="number" label="Per-user limit" value={form.perUserLimit} onChange={set("perUserLimit")} />
          <Box sx={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </Box>
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default CouponFormScreen;
