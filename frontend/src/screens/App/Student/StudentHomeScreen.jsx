import { Box, Typography } from "@mui/material";

// Placeholder. The real student storefront (course cards, hero, clean
// consumer/edtech design) is built in Part 2 — intentionally NOT the
// admin dashboard aesthetic.
const StudentHomeScreen = () => (
  <Box sx={{ p: 1 }}>
    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d3", mb: 1 }}>
      Welcome to B.Sc Nepal
    </Typography>
    <Typography sx={{ color: "#6b7280" }}>
      Your program catalog — years, subjects, notes, PDFs, videos and live
      classes — arrives in Part 2.
    </Typography>
  </Box>
);

export default StudentHomeScreen;
