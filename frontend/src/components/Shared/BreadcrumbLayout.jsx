import { Link } from "react-router-dom";
import { Alert, Box, CircularProgress, Paper, Typography } from "@mui/material";

import { tokens } from "../../theme";

// Compound layout used by every admin/teacher screen.
export const BreadcrumbLayout = ({
  children,
  isBusy = false,
  breadcrumbs = [],
  headerActions = null,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        px: 2,
        py: 1.5,
        borderRadius: 2.5,
      }}
    >
      <Box
        component="nav"
        aria-label="breadcrumb"
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
      >
        {breadcrumbs.map((crumb, i) => {
          const last = i === breadcrumbs.length - 1;
          return (
            <Box key={i} sx={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
              {crumb.path && !last ? (
                <Typography
                  component={Link}
                  to={crumb.path}
                  variant="body2"
                  sx={{
                    color: tokens.muted,
                    textDecoration: "none",
                    "&:hover": { color: tokens.ink },
                  }}
                >
                  {crumb.title}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: last ? tokens.ink : tokens.muted, fontWeight: last ? 600 : 400 }}
                >
                  {crumb.title}
                </Typography>
              )}
              {!last && (
                <Typography variant="body2" sx={{ color: tokens.faint }}>
                  /
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {isBusy && <CircularProgress size={18} thickness={5} />}
        {headerActions}
      </Box>
    </Paper>
    {children}
  </Box>
);

BreadcrumbLayout.Paper = function BLPaper({ children, ...props }) {
  return (
    <Paper variant="outlined" sx={{ p: 0, borderRadius: 2.5 }} {...props}>
      {children}
    </Paper>
  );
};

BreadcrumbLayout.Error = function BLError({ error }) {
  if (!error) return null;
  const message = error?.data?.message || error?.error || "Something went wrong";
  return <Alert severity="error">{message}</Alert>;
};

export default BreadcrumbLayout;
