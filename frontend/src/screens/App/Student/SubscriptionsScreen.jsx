import { Box, Chip, Paper, Typography } from "@mui/material";

import { useGetMySubscriptionsQuery } from "../../../store/services/orderApi";

const fmt = (d) => new Date(d).toLocaleDateString();

const label = (s) =>
  s.type === "subject" ? s.subject?.name : s.type === "year" ? s.year?.yearName : s.program?.name;

const SubscriptionsScreen = () => {
  const { data, isLoading } = useGetMySubscriptionsQuery();
  const subs = data?.data || [];

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>My subscriptions</Typography>
      {isLoading && <Typography color="text.secondary">Loading…</Typography>}
      {!isLoading && subs.length === 0 && <Typography color="text.secondary">No active subscriptions.</Typography>}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {subs.map((s) => (
          <Paper key={s._id} variant="outlined" sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{label(s)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {s.type} · expires {fmt(s.expiresAt)}
              </Typography>
            </Box>
            <Chip size="small" label={s.status} color={s.status === "active" ? "success" : s.status === "refunded" ? "default" : "warning"} />
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default SubscriptionsScreen;
