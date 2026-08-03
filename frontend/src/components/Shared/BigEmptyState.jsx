import { Box, Button, Paper, Typography } from "@mui/material";

import { statusTokens, tokens } from "../../theme";

/**
 * First-run guidance. A teacher opening a brand-new subject should see one
 * sentence explaining what this screen is for and one large button telling them
 * exactly what to do — not a bare "+ Add" link in a corner.
 */
export const BigEmptyState = ({ icon, title, body, actionLabel, onAction, tone = "info" }) => {
  const t = statusTokens[tone] ?? statusTokens.info;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderStyle: "dashed",
        borderColor: tokens.borderStrong,
        px: 3,
        py: 6,
        textAlign: "center",
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: t.bg,
            color: t.solid,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            "& svg": { fontSize: 30 },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>

      {body && (
        <Typography
          variant="body2"
          sx={{ color: tokens.muted, maxWidth: 420, mx: "auto", mb: 3, lineHeight: 1.6 }}
        >
          {body}
        </Typography>
      )}

      {actionLabel && (
        <Button
          variant="contained"
          size="large"
          onClick={onAction}
          sx={{ px: 4, py: 1.25, fontSize: "0.95rem" }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default BigEmptyState;
