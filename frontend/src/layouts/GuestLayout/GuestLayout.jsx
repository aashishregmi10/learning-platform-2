import { Link, Outlet } from "react-router-dom";

// Simple public storefront chrome — not the MUI SidebarLayout used by the
// authenticated app. Matches the plain inline-styled consumer/edtech look
// established by the student screens (SubjectViewScreen, StudentCatalogScreen).
const GuestLayout = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <header
      style={{
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 24px", borderBottom: "1px solid var(--border)", background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "var(--primary)", fontWeight: 800, fontSize: 19 }}>
        B.Sc Nepal
      </Link>
      <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#1C1C1C", fontSize: 14, fontWeight: 500 }}>Browse Courses</Link>
        <Link to="/verify" style={{ textDecoration: "none", color: "#1C1C1C", fontSize: 14, fontWeight: 500 }}>Verify Certificate</Link>
        <Link
          to="/login"
          style={{ textDecoration: "none", background: "var(--primary)", color: "#fff", borderRadius: 6, padding: "8px 18px", fontWeight: 700, fontSize: 14 }}
        >
          Sign in
        </Link>
      </nav>
    </header>
    <main style={{ flex: 1, padding: "32px 24px" }}>
      <Outlet />
    </main>
    <footer style={{ padding: "20px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13, borderTop: "1px solid var(--border)" }}>
      © {new Date().getFullYear()} B.Sc Nepal — built for Tribhuvan University students.
    </footer>
  </div>
);

export default GuestLayout;
