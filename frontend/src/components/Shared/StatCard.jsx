import { Box, Paper, Typography } from "@mui/material";

import { statusTokens } from "../../theme";

/**
 * The number-over-label tiles that head a dashboard.
 *
 * Every card is tinted — `tone` picks which role. Descriptive counts use "info"
 * (the default): coloured, but making no claim about whether the number is good.
 * Pass success/warning/danger where the value itself is a verdict, e.g. revenue
 * of zero or questions still waiting on an answer.
 */
export const StatCard = ({ value, label, tone = "info", hint, icon }) => {
  const t = statusTokens[tone] ?? statusTokens.info;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        bgcolor: t.bg,
        borderColor: "transparent",
        position: "relative",
        overflow: "hidden",
        // Colour rail along the top edge, so the tone survives at a glance.
        "&:before": {
          content: '""',
          position: "absolute",
          insetInline: 0,
          top: 0,
          height: 3,
          bgcolor: t.solid,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.1, color: t.fg }}>
          {value}
        </Typography>
        {icon && <Box sx={{ color: t.solid, display: "flex", "& svg": { fontSize: 22 } }}>{icon}</Box>}
      </Box>
      <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: t.fg, opacity: 0.85 }}>
        {label}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: t.fg, fontWeight: 700 }}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
};

export const StatCardRow = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gap: 2,
      gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
    }}
  >
    {children}
  </Box>
);

export default StatCard;
