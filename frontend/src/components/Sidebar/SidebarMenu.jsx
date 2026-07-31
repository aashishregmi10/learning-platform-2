import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

import { statusTokens, tokens } from "../../theme";

/**
 * Data-driven nav list.
 * menu = [{ title, path, icon, end?, badge?, meta?, dot?, children? }]
 *
 * `end` forces an exact-path match. Index routes like /app/admin must set it,
 * otherwise NavLink treats every child route as a prefix match and the parent
 * stays highlighted alongside the real destination.
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

const Leaf = ({ item, nested = false }) => (
  <ListItemButton
    component={NavLink}
    to={item.path}
    end={item.end}
    sx={{
      ...activeSx,
      py: nested ? 0.6 : 0.9,
      pl: nested ? 4.5 : 1.5,
      pr: 1.5,
      minHeight: 40,
      gap: 1,
    }}
  >
    {item.dot && <Dot color={item.dot} />}
    {item.icon && (
      <ListItemIcon
        sx={{
          minWidth: 32,
          // Each nav item carries its own accent so the rail scans by colour.
          color: item.color ?? statusTokens.info.solid,
          "& svg": { fontSize: 20 },
        }}
      >
        {item.icon}
      </ListItemIcon>
    )}
    <ListItemText
      primary={item.title}
      primaryTypographyProps={{
        fontSize: nested ? "0.83rem" : "0.88rem",
        noWrap: true,
        color: nested ? tokens.body : "inherit",
      }}
    />
    {item.meta && <Meta>{item.meta}</Meta>}
    {item.badge ? <Badge value={item.badge} /> : null}
  </ListItemButton>
);

const Group = ({ item }) => {
  const { pathname } = useLocation();
  // Open on load when the current route is inside this group.
  const [open, setOpen] = useState(() => !!item.path && pathname.startsWith(item.path));

  return (
    <>
      <ListItemButton
        onClick={() => setOpen((o) => !o)}
        sx={{ py: 0.9, px: 1.5, minHeight: 40, gap: 1 }}
      >
        {item.icon && (
          <ListItemIcon
            sx={{
              minWidth: 32,
              color: item.color ?? statusTokens.info.solid,
              "& svg": { fontSize: 20 },
            }}
          >
            {item.icon}
          </ListItemIcon>
        )}
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

export const SidebarMenu = ({ menu = [] }) => (
  <List sx={{ px: 1, py: 1 }}>
    {menu.map((item) =>
      item.children?.length ? (
        <Group key={item.title} item={item} />
      ) : (
        <Leaf key={item.path} item={item} />
      )
    )}
  </List>
);

export default SidebarMenu;
