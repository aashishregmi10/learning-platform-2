// Gradient header banner reused across every student dashboard page — gives
// the storefront a consistent brand identity instead of a bare <h1>.
const PageHeader = ({ eyebrow, title, subtitle, right }) => (
  <div
    style={{
      borderRadius: 16, overflow: "hidden", marginBottom: 28, padding: "26px 28px",
      background: "linear-gradient(120deg, var(--student-ink) 0%, var(--student-ink-2) 100%)", color: "#fff",
      display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
    }}
  >
    <div>
      {eyebrow && (
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.75 }}>
          {eyebrow}
        </span>
      )}
      <h1 style={{ margin: "6px 0 0", fontSize: 26 }}>{title}</h1>
      {subtitle && <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: 14 }}>{subtitle}</p>}
    </div>
    {right && <div>{right}</div>}
  </div>
);

export default PageHeader;
