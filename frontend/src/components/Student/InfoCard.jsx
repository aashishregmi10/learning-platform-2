import { Link } from "react-router-dom";
import { Chip } from "@mui/material";

// Shared two-tone card shell used across Catalog/Subscriptions/Orders/
// Certificates/Live Classes: grey top zone (pills + icon placeholder),
// white bottom zone (meta line, title, divider, footer row).
const InfoCard = ({ to, href, pills = [], icon, title, meta, footerLeft, footerRight, footerColor }) => {
  const Wrapper = to ? Link : href ? "a" : "div";
  const wrapperProps = to
    ? { to, className: "guest-card" }
    : href
      ? { href, target: "_blank", rel: "noreferrer", className: "guest-card" }
      : { className: "guest-card" };

  return (
    <Wrapper
      {...wrapperProps}
      style={{
        textDecoration: "none", border: "1px solid var(--border)", borderRadius: 16,
        background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden",
      }}
    >
      <div style={{ background: "#eef1f4", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pills.map((p, i) => {
            const c = p.color || "var(--student-ink-2)";
            return (
              <Chip
                key={i}
                size="small"
                label={p.label}
                sx={{
                  height: 22, fontWeight: 700,
                  bgcolor: p.tone === "solid" ? c : "#fff",
                  color: p.tone === "solid" ? "#fff" : c,
                  border: p.tone === "solid" ? "none" : `1px solid ${c}`,
                }}
              />
            );
          })}
        </div>
        <div style={{ height: 84, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>

      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        {meta}
        <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: "#1C1C1C" }}>{title}</span>
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{footerLeft}</span>
          <span style={{ color: footerColor || "var(--student-ink-2)", fontWeight: 700, fontSize: 13 }}>{footerRight}</span>
        </div>
      </div>
    </Wrapper>
  );
};

export default InfoCard;
