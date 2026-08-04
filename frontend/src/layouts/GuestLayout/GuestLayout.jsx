import { Link, Outlet } from "react-router-dom";

import { tokens } from "../../theme";

/**
 * Public storefront chrome — not the MUI SidebarLayout used by the app.
 *
 * The header, footer and every page section stretch edge to edge; the content
 * column inside them is capped by `.page`. Previously the whole page was one
 * narrow centred div, which left wide screens with dead gutters either side.
 */
const navLink = {
  textDecoration: "none",
  color: tokens.body,
  fontSize: 14,
  fontWeight: 500,
};

const GuestLayout = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: tokens.surface }}>
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: `1px solid ${tokens.border}`,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="page"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 64,
        }}
      >
        <Link
          to="/"
          style={{ textDecoration: "none", color: "var(--primary)", fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em" }}
        >
          Atomica Academy Nepal
        </Link>
        <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <Link to="/" style={navLink}>
            Browse subjects
          </Link>
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: 8,
              padding: "9px 20px",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>

    <main style={{ flex: 1 }}>
      <Outlet />
    </main>

    <footer style={{ borderTop: `1px solid ${tokens.border}`, background: tokens.surfaceMuted }}>
      <div
        className="page"
        style={{
          paddingBlock: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          color: tokens.muted,
          fontSize: 13,
        }}
      >
        <span>© {new Date().getFullYear()} Atomica Academy Nepal — built for Tribhuvan University students.</span>
        <Link to="/login" style={{ ...navLink, fontSize: 13, color: "var(--primary)" }}>
          Sign in
        </Link>
      </div>
    </footer>
  </div>
);

export default GuestLayout;
