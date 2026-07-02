import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Box, Divider, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { NotificationsOutlined } from "@mui/icons-material";

import { useGetMyNotificationsQuery, useMarkNotificationReadMutation } from "../../store/services/notificationApi";
import { useAuth } from "../../hooks/useAuth";

const NotificationBell = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { data } = useGetMyNotificationsQuery({ limit: 5 }, { pollingInterval: 60000 });
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const openOne = (n) => {
    if (!n.isRead) markRead(n._id);
    setAnchorEl(null);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { width: 340 } }}>
        {notifications.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>Nothing here yet.</Typography>
          </MenuItem>
        )}
        {notifications.map((n) => (
          <MenuItem key={n._id} onClick={() => openOne(n)} sx={{ whiteSpace: "normal", opacity: n.isRead ? 0.6 : 1 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 700 }}>{n.title}</Typography>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>{n.message}</Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate(`/app/${role}/notifications`); }}>
          <Typography variant="body2" sx={{ color: "#1976d3" }}>See all notifications</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationBell;
