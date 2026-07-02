import { NavLink } from "react-router-dom";
import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

// Data-driven nav list. menu = [{ title, path, icon }]
export const SidebarMenu = ({ menu = [] }) => (
  <List>
    {menu.map((item) => (
      <ListItemButton
        key={item.path}
        component={NavLink}
        to={item.path}
        sx={{
          "&.active": { bgcolor: "#edf5ff", color: "#1976d3", fontWeight: 600 },
        }}
      >
        {item.icon && <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>}
        <ListItemText primary={item.title} />
      </ListItemButton>
    ))}
  </List>
);

export default SidebarMenu;
