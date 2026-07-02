import { Link, Outlet } from "react-router-dom";

// Simple public storefront chrome — not the MUI SidebarLayout used by the
// authenticated app. Matches the plain inline-styled consumer/edtech look
// established by the student screens (SubjectViewScreen, StudentCatalogScreen).
const GuestLayout = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <header
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px", borderBottom: "1px solid #e0e0e0", background: "#fff",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "#1976d3", fontWeight: 700, fontSize: 18 }}>
        B.Sc Nepal
      </Link>
      <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#1C1C1C", fontSize: 14 }}>Browse Courses</Link>
        <Link to="/verify" style={{ textDecoration: "none", color: "#1C1C1C", fontSize: 14 }}>Verify Certificate</Link>
        <Link
          to="/login"
          style={{ textDecoration: "none", background: "#1976d3", color: "#fff", borderRadius: 6, padding: "8px 16px", fontWeight: 600, fontSize: 14 }}
        >
          Sign in
        </Link>
      </nav>
    </header>
    <main style={{ flex: 1, padding: "32px 24px" }}>
      <Outlet />
    </main>
  </div>
);

export default GuestLayout;
