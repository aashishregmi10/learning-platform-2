import { createTheme } from "@mui/material/styles";

// Mirrors can-logistic's design tokens (src/index.css :root + default MUI theme).
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d3" },
    success: { main: "#66bb6a" },
    background: { default: "#fafafa", paper: "#ffffff" },
  },
  typography: {
    // can-logistic forces Montserrat everywhere; 16px base.
    fontFamily: "Montserrat, sans-serif",
    fontSize: 16,
  },
  shape: { borderRadius: 6 },
});

export default theme;
