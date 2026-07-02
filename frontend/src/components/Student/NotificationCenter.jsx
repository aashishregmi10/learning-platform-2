import { useNavigate } from "react-router-dom";

import { useGetMyNotificationsQuery, useMarkNotificationReadMutation } from "../../store/services/notificationApi";

const TYPE_LABEL = { live_class: "📺", new_content: "🆕", subscription: "💳", system: "⚙️", promotion: "🏷️" };

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyNotificationsQuery({ limit: 50 });
  const [markRead] = useMarkNotificationReadMutation();
  const notifications = data?.data ?? [];

  const open = (n) => {
    if (!n.isRead) markRead(n._id);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  if (isLoading) return <div style={{ color: "#8C7B6B" }}>Loading…</div>;
  if (notifications.length === 0) {
    return <p style={{ color: "#8C7B6B" }}>Nothing here yet — let's fix that.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {notifications.map((n) => (
        <div
          key={n._id}
          onClick={() => open(n)}
          style={{
            display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", borderRadius: 10,
            border: "1px solid #E7E0D4", background: n.isRead ? "transparent" : "#FAF7F2", cursor: n.actionUrl ? "pointer" : "default",
          }}
        >
          <span style={{ fontSize: 20 }}>{TYPE_LABEL[n.type] || "🔔"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: n.isRead ? 400 : 700 }}>{n.title}</div>
            <div style={{ color: "#8C7B6B", fontSize: 14 }}>{n.message}</div>
            <div style={{ color: "#8C7B6B", fontSize: 12, marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
          </div>
          {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2D5A3D", marginTop: 6 }} />}
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
