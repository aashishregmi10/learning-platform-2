import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

const NotFoundScreen = () => (
  <Box sx={{ textAlign: "center", py: 8 }}>
    <Typography variant="h3" sx={{ fontWeight: 700, color: "#171717" }}>
      404
    </Typography>
    <Typography sx={{ color: "#71717A", mb: 3 }}>
      Nothing here yet — let's get you back.
    </Typography>
    <Button component={Link} to="/" variant="contained">
      Go home
    </Button>
  </Box>
);

export default NotFoundScreen;
