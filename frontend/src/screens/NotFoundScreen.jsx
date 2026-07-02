import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

const NotFoundScreen = () => (
  <Box sx={{ textAlign: "center", py: 8 }}>
    <Typography variant="h3" sx={{ fontWeight: 700, color: "#1976d3" }}>
      404
    </Typography>
    <Typography sx={{ color: "#6b7280", mb: 3 }}>
      Nothing here yet — let's get you back.
    </Typography>
    <Button component={Link} to="/" variant="contained" sx={{ bgcolor: "#1976d3" }}>
      Go home
    </Button>
  </Box>
);

export default NotFoundScreen;
