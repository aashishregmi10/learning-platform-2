import { useCallback, useMemo, useState } from "react";
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
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";

import { useAuth } from "../../hooks/useAuth";
import { removeUser } from "../../store/authSlice";
import { statusTokens, tokens } from "../../theme";
import NotificationBell from "../../components/Shared/NotificationBell";
import LanguageToggle from "../../components/Shared/LanguageToggle";
import SidebarContext from "../../components/Sidebar/SidebarContext";

const EXPANDED_WIDTH = 250;
const COLLAPSED_WIDTH = 72;
const STORAGE_KEY = "bscnepal.sidebarCollapsed";

// Slot-based dashboard shell (admin/teacher/student). `sidebar` is the role
// sidebar. Everything is white-on-hairline — no shadows, no colour chrome.
//
// The rail collapses to icons only; the choice persists so it survives a
// reload. Mobile keeps the full-width temporary drawer either way — a 72px
// rail on a phone would be worse than the hamburger.
const SidebarLayout = ({ sidebar: Sidebar = null, title = "B.Sc Nepal" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const { loggedInUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // storage disabled — the choice just won't persist
      }
      return next;
    });
  }, []);

  const handleLogout = () => {
    dispatch(removeUser());
    navigate("/login");
  };

  // `isCollapsed` lets the temporary mobile drawer force the expanded rendering
  // even while the desktop rail is collapsed.
  const drawerContent = (isCollapsed) => (
    <SidebarContext.Provider value={{ collapsed: isCollapsed }}>
      <Box sx={{ height: "100%", bgcolor: tokens.surface }}>
        <Toolbar
          sx={{
            px: isCollapsed ? 0 : 2.5,
            justifyContent: isCollapsed ? "center" : "space-between",
            gap: 1,
          }}
        >
          {!isCollapsed && (
            <Typography
              noWrap
              sx={{ fontWeight: 700, fontSize: "1rem", color: statusTokens.info.fg }}
            >
              {title}
            </Typography>
          )}
          <Tooltip title={isCollapsed ? "Expand menu" : "Collapse menu"} placement="right">
            <IconButton
              size="small"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
              sx={{ display: { xs: "none", sm: "inline-flex" }, color: tokens.muted }}
            >
              {isCollapsed ? (
                <ChevronRightOutlined fontSize="small" />
              ) : (
                <ChevronLeftOutlined fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Divider />
        {Sidebar && <Sidebar />}
      </Box>
    </SidebarContext.Provider>
  );

  const contextValue = useMemo(() => ({ collapsed }), [collapsed]);

  return (
    <SidebarContext.Provider value={contextValue}>
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
            transition: (theme) =>
              theme.transitions.create(["width", "margin"], { duration: 200 }),
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
            <LanguageToggle />
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

        <Box
          component="nav"
          sx={{
            width: { sm: drawerWidth },
            flexShrink: { sm: 0 },
            transition: (theme) => theme.transitions.create("width", { duration: 200 }),
          }}
        >
          {/* Mobile: always the full labelled drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, borderColor: tokens.border },
            }}
          >
            {drawerContent(false)}
          </Drawer>

          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                borderRight: `1px solid ${tokens.border}`,
                overflowX: "hidden",
                transition: (theme) => theme.transitions.create("width", { duration: 200 }),
              },
            }}
          >
            {drawerContent(collapsed)}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            bgcolor: tokens.canvas,
            transition: (theme) => theme.transitions.create("width", { duration: 200 }),
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </SidebarContext.Provider>
  );
};

export default SidebarLayout;
