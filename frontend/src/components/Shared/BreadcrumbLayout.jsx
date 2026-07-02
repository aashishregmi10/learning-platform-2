import { Link } from "react-router-dom";
import { Alert, CircularProgress, Paper } from "@mui/material";

// Compound layout used by every admin/teacher screen (mirrors can-logistic).
export const BreadcrumbLayout = ({
  children,
  isBusy = false,
  breadcrumbs = [],
  headerActions = null,
}) => (
  <div className="breadcrumb-layout" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Paper
      variant="outlined"
      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}
    >
      <nav aria-label="breadcrumb" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {breadcrumbs.map((crumb, i) => {
          const last = i === breadcrumbs.length - 1;
          return (
            <span key={i} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              {crumb.path && !last ? (
                <Link to={crumb.path} style={{ color: "#1976d3", textDecoration: "none" }}>
                  {crumb.title}
                </Link>
              ) : (
                <span style={{ color: last ? "#1C1C1C" : "#6b7280", fontWeight: last ? 600 : 400 }}>
                  {crumb.title}
                </span>
              )}
              {!last && <span style={{ color: "#6b7280" }}>/</span>}
            </span>
          );
        })}
      </nav>
      {isBusy ? <CircularProgress size={22} thickness={5} /> : headerActions}
    </Paper>
    {children}
  </div>
);

BreadcrumbLayout.Paper = function BLPaper({ children, ...props }) {
  return (
    <Paper variant="outlined" sx={{ p: 0 }} {...props}>
      {children}
    </Paper>
  );
};

BreadcrumbLayout.Error = function BLError({ error }) {
  if (!error) return null;
  const message = error?.data?.message || error?.error || "Something went wrong";
  return (
    <Alert severity="error" variant="outlined">
      {message}
    </Alert>
  );
};

export default BreadcrumbLayout;
