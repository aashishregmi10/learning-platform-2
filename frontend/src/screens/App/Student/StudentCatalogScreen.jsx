import { Link, useNavigate } from "react-router-dom";

import { useGetMyCatalogQuery } from "../../../store/services/catalogApi";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const SubjectCard = ({ subject }) => (
  <Link
    to={`/app/student/subjects/${subject._id}`}
    style={{
      textDecoration: "none",
      border: "1px solid #e0e0e0",
      borderRadius: 10,
      overflow: "hidden",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ height: 96, background: "linear-gradient(135deg,#1976d3,#1565c0)", display: "flex", alignItems: "flex-end", padding: 12 }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{subject.name}</span>
    </div>
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", color: "#1C1C1C", fontWeight: 600 }}>{money(subject.pricing?.discountedPrice)}</span>
        {subject.entitled ? (
          <span style={{ fontSize: 12, color: "#1976d3", fontWeight: 600 }}>✓ Enrolled</span>
        ) : (
          <span style={{ fontSize: 12, color: "#6b7280" }}>{subject.totalChapters} chapters</span>
        )}
      </div>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{subject.category}</span>
    </div>
  </Link>
);

const StudentCatalogScreen = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyCatalogQuery();
  const catalog = data?.data;

  const buyYear = (year) =>
    navigate("/app/student/checkout", {
      state: {
        items: [
          {
            itemType: "year",
            year: year._id,
            title: `${year.yearName} bundle`,
            price: year.bundlePrice?.discountedPrice,
          },
        ],
      },
    });

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280" }}>Loading your catalog…</div>;

  if (!catalog?.program) {
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#1976d3" }}>Welcome to B.Sc Nepal</h2>
        <p style={{ color: "#6b7280" }}>No program is assigned to your account yet. Once enrolled, your years and subjects show up here.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ color: "#6b7280", margin: 0, textTransform: "uppercase", letterSpacing: 1, fontSize: 12 }}>Your program</p>
        <h1 style={{ color: "#1976d3", margin: "4px 0 0" }}>{catalog.program.name}</h1>
      </header>

      {catalog.years.map((year) => (
        <section key={year._id} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>{year.yearName}</h2>
            <button onClick={() => buyYear(year)} style={{ background: "#1976d3", color: "#fff", border: 0, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>
              Buy bundle — {money(year.bundlePrice?.discountedPrice)}
            </button>
          </div>
          {year.subjects.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No subjects published for this year yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {year.subjects.map((s) => <SubjectCard key={s._id} subject={s} />)}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default StudentCatalogScreen;
