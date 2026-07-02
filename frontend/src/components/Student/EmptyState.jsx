// Consistent empty state for Subscriptions/Orders/Certificates/Live Classes —
// replaces the bare "No X yet." text that made those pages feel unfinished.
const EmptyState = ({ icon, title, subtitle, action }) => (
  <div
    style={{
      textAlign: "center", padding: "48px 24px", borderRadius: 14,
      border: "1px dashed var(--border)", background: "#fff",
    }}
  >
    {icon && <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>{icon}</div>}
    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</div>
    {subtitle && <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: action ? 16 : 0 }}>{subtitle}</div>}
    {action}
  </div>
);

export default EmptyState;
