import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon, Logout } from "@mui/icons-material";

import { useAuth } from "../../hooks/useAuth";
import { removeUser } from "../../store/authSlice";
import NotificationBell from "../../components/Shared/NotificationBell";

const drawerWidth = 250;

// Slot-based dashboard shell (admin/teacher). `sidebar` is the role sidebar.
const SidebarLayout = ({ sidebar: Sidebar = null, title = "B.Sc Nepal" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { loggedInUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(removeUser());
    navigate("/login");
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d3" }}>
          {title}
        </Typography>
      </Toolbar>
      <Divider />
      {Sidebar && <Sidebar />}
    </div>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "#fff",
          color: "#1C1C1C",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {loggedInUser && <NotificationBell />}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar src={loggedInUser?.avatar} sx={{ width: 32, height: 32 }}>
              {loggedInUser?.name?.[0]}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              {loggedInUser?.name} · {loggedInUser?.role}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" style={{ marginRight: 8 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, borderRight: "1px solid #e0e0e0" },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, bgcolor: "#f5f5f5" }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default SidebarLayout;
