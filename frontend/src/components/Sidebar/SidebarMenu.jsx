import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

import { statusTokens, tokens } from "../../theme";
import { useSidebarCollapsed } from "./SidebarContext";

/**
 * Data-driven nav list.
 * menu = [{ title, path, icon, end?, badge?, meta?, dot?, color?, children? }]
 *
 * `end` forces an exact-path match. Index routes like /app/admin must set it,
 * otherwise NavLink treats every child route as a prefix match and the parent
 * stays highlighted alongside the real destination.
 *
 * Collapsed mode (icon rail) is driven by SidebarContext: labels drop away,
 * every item gets a tooltip so nothing becomes a guessing game, and a group's
 * children move into a flyout menu so they stay reachable.
 */
const activeSx = {
  "&.active": {
    bgcolor: statusTokens.info.bg,
    color: statusTokens.info.fg,
    fontWeight: 600,
    "& .MuiListItemText-primary": { fontWeight: 600, color: statusTokens.info.fg },
    // The active item gets a left rail so it reads even at a glance.
    boxShadow: `inset 3px 0 0 ${statusTokens.info.solid}`,
    "& .MuiListItemIcon-root": { color: statusTokens.info.solid },
  },
};

const Badge = ({ value }) => (
  <Box
    component="span"
    sx={{
      minWidth: 20,
      px: 0.75,
      py: "1px",
      borderRadius: 999,
      // A count of things waiting on you — danger, same role as the stat cards.
      bgcolor: statusTokens.danger.bg,
      color: statusTokens.danger.fg,
      fontSize: "0.7rem",
      fontWeight: 700,
      textAlign: "center",
    }}
  >
    {value}
  </Box>
);

/** Collapsed rail has no room for a pill, so the count becomes a corner dot. */
const BadgeDot = () => (
  <Box
    component="span"
    sx={{
      position: "absolute",
      top: 6,
      right: 12,
      width: 8,
      height: 8,
      borderRadius: "50%",
      bgcolor: statusTokens.danger.solid,
      border: `2px solid ${tokens.surface}`,
    }}
  />
);

const Meta = ({ children }) => (
  <Typography component="span" sx={{ fontSize: "0.72rem", color: tokens.faint, flexShrink: 0 }}>
    {children}
  </Typography>
);

const Dot = ({ color }) => (
  <Box
    component="span"
    sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color, flexShrink: 0, mr: 1.25 }}
  />
);

const iconSx = (item) => ({
  minWidth: 32,
  // Each nav item carries its own accent so the rail scans by colour.
  color: item.color ?? statusTokens.info.solid,
  "& svg": { fontSize: 20 },
});

const Leaf = ({ item, nested = false }) => {
  const collapsed = useSidebarCollapsed();

  const button = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      end={item.end}
      sx={{
        ...activeSx,
        position: "relative",
        py: collapsed ? 1.1 : nested ? 0.6 : 0.9,
        pl: collapsed ? 0 : nested ? 4.5 : 1.5,
        pr: collapsed ? 0 : 1.5,
        minHeight: 44,
        gap: collapsed ? 0 : 1,
        justifyContent: collapsed ? "center" : "flex-start",
      }}
    >
      {!collapsed && item.dot && <Dot color={item.dot} />}
      {item.icon && (
        <ListItemIcon sx={{ ...iconSx(item), minWidth: collapsed ? 0 : 32 }}>
          {item.icon}
        </ListItemIcon>
      )}
      {/* A nested item with no icon still needs something to show collapsed. */}
      {collapsed && !item.icon && <Dot color={item.dot ?? tokens.faint} />}

      {!collapsed && (
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{
            fontSize: nested ? "0.83rem" : "0.88rem",
            noWrap: true,
            color: nested ? tokens.body : "inherit",
          }}
        />
      )}
      {!collapsed && item.meta && <Meta>{item.meta}</Meta>}
      {!collapsed && item.badge ? <Badge value={item.badge} /> : null}
      {collapsed && item.badge ? <BadgeDot /> : null}
    </ListItemButton>
  );

  if (!collapsed) return button;

  return (
    <Tooltip title={item.meta ? `${item.title} · ${item.meta}` : item.title} placement="right">
      {button}
    </Tooltip>
  );
};

const Group = ({ item }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const collapsed = useSidebarCollapsed();
  // Open on load when the current route is inside this group.
  const [open, setOpen] = useState(() => !!item.path && pathname.startsWith(item.path));
  const [flyoutEl, setFlyoutEl] = useState(null);

  // Collapsed: one icon that opens the children as a flyout, so nothing in the
  // group becomes unreachable just because the rail is narrow.
  if (collapsed) {
    return (
      <>
        <Tooltip title={item.title} placement="right">
          <ListItemButton
            onClick={(e) => setFlyoutEl(e.currentTarget)}
            sx={{ py: 1.1, minHeight: 44, justifyContent: "center" }}
          >
            {item.icon && (
              <ListItemIcon sx={{ ...iconSx(item), minWidth: 0 }}>{item.icon}</ListItemIcon>
            )}
          </ListItemButton>
        </Tooltip>

        <Menu
          anchorEl={flyoutEl}
          open={!!flyoutEl}
          onClose={() => setFlyoutEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem disabled sx={{ opacity: "1 !important", fontWeight: 700, fontSize: "0.78rem" }}>
            {item.title}
          </MenuItem>
          {item.children.map((child) => (
            <MenuItem
              key={child.path}
              selected={pathname === child.path}
              onClick={() => {
                setFlyoutEl(null);
                navigate(child.path);
              }}
              sx={{ fontSize: "0.85rem", gap: 1.25 }}
            >
              {child.dot && <Dot color={child.dot} />}
              {child.title}
              {child.meta && <Meta>{child.meta}</Meta>}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <>
      <ListItemButton
        onClick={() => setOpen((o) => !o)}
        sx={{ py: 0.9, px: 1.5, minHeight: 40, gap: 1 }}
      >
        {item.icon && <ListItemIcon sx={iconSx(item)}>{item.icon}</ListItemIcon>}
        <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: "0.88rem" }} />
        {open ? (
          <ExpandLess sx={{ fontSize: 18, color: tokens.faint }} />
        ) : (
          <ExpandMore sx={{ fontSize: 18, color: tokens.faint }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding sx={{ px: 1 }}>
          {item.children.map((child) => (
            <Leaf key={child.path} item={child} nested />
          ))}
        </List>
      </Collapse>
    </>
  );
};

export const SidebarMenu = ({ menu = [] }) => {
  const collapsed = useSidebarCollapsed();
  return (
    <List sx={{ px: collapsed ? 0.75 : 1, py: 1 }}>
      {menu.map((item) =>
        item.children?.length ? (
          <Group key={item.title} item={item} />
        ) : (
          <Leaf key={item.path} item={item} />
        )
      )}
    </List>
  );
};

export default SidebarMenu;
