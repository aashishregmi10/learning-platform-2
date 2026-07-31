import { Link } from "react-router-dom";
import { Chip } from "@mui/material";

import { statusTokens, tokens } from "../../theme";

/**
 * Shared two-tone card shell used across Catalog/Subscriptions/Orders/
 * Certificates/Live Classes: grey top zone (pills + icon), white bottom zone
 * (meta line, title, divider, footer row).
 *
 * Pills take `{ label, role }` where role is one of the five status roles.
 * A pill with no role is descriptive (a type, a category) and stays grey —
 * colour on this card always means good/attention/bad, never variety.
 */
const InfoCard = ({ to, href, pills = [], icon, title, meta, footerLeft, footerRight, footerRole }) => {
  const Wrapper = to ? Link : href ? "a" : "div";
  const wrapperProps = to
    ? { to, className: "guest-card" }
    : href
      ? { href, target: "_blank", rel: "noreferrer", className: "guest-card" }
      : { className: "guest-card" };

  const footerTone = footerRole ? statusTokens[footerRole] : null;

  return (
    <Wrapper
      {...wrapperProps}
      style={{
        textDecoration: "none",
        border: "1px solid var(--border)",
        borderRadius: 16,
        background: tokens.surface,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: tokens.surfaceMuted,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pills.map((p, i) => {
            const tone = statusTokens[p.role] ?? statusTokens.neutral;
            return (
              <Chip
                key={i}
                size="small"
                label={p.label}
                sx={{
                  height: 22,
                  fontWeight: 700,
                  bgcolor: tone.bg,
                  color: tone.fg,
                  border: "none",
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            height: 84,
            borderRadius: 10,
            background: tokens.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        {meta}
        <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: tokens.ink }}>
          {title}
        </span>
        <div
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: 4,
            paddingTop: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{footerLeft}</span>
          <span
            style={{ color: footerTone ? footerTone.fg : tokens.ink, fontWeight: 700, fontSize: 13 }}
          >
            {footerRight}
          </span>
        </div>
      </div>
    </Wrapper>
  );
};

export default InfoCard;
