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
import { statusTokens, tokens } from "../../theme";
import NotificationBell from "../../components/Shared/NotificationBell";

const drawerWidth = 250;

// Slot-based dashboard shell (admin/teacher/student). `sidebar` is the role
// sidebar. Everything is white-on-hairline — no shadows, no colour chrome.
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
    <Box sx={{ height: "100%", bgcolor: tokens.surface }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: statusTokens.info.fg }}>
          {title}
        </Typography>
      </Toolbar>
      <Divider />
      {Sidebar && <Sidebar />}
    </Box>
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
          bgcolor: tokens.surface,
          color: tokens.ink,
          borderBottom: `1px solid ${tokens.border}`,
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
            <Avatar
              src={loggedInUser?.avatar}
              sx={{ width: 32, height: 32, bgcolor: statusTokens.info.solid, fontSize: "0.85rem" }}
            >
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
            "& .MuiDrawer-paper": { width: drawerWidth, borderColor: tokens.border },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRight: `1px solid ${tokens.border}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: tokens.canvas,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default SidebarLayout;
