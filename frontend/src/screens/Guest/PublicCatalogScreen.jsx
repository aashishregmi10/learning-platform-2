import { Link, useParams } from "react-router-dom";

import { useGetPublicCatalogQuery } from "../../store/services/catalogApi";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const SubjectCard = ({ subject }) => (
  <Link
    to={`/subjects/${subject.slug}`}
    style={{
      textDecoration: "none", border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden",
      background: "#fff", display: "flex", flexDirection: "column",
    }}
  >
    <div style={{ height: 96, background: "linear-gradient(135deg,#1976d3,#1565c0)", display: "flex", alignItems: "flex-end", padding: 12 }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{subject.name}</span>
    </div>
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", color: "#1C1C1C", fontWeight: 600 }}>{money(subject.pricing?.discountedPrice)}</span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{subject.totalChapters} chapters</span>
      </div>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{subject.category}</span>
    </div>
  </Link>
);

const PublicCatalogScreen = () => {
  const { programSlug } = useParams();
  const { data, isLoading, error } = useGetPublicCatalogQuery(programSlug);
  const catalog = data?.data;

  if (isLoading) return <div style={{ color: "#6b7280" }}>Loading…</div>;
  if (error || !catalog) return <div style={{ padding: 24 }}>Program not found.</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Link to="/" style={{ color: "#1976d3", fontSize: 14 }}>← Back to programs</Link>
      <h1 style={{ color: "#1976d3", marginTop: 8 }}>{catalog.program.name}</h1>
      {catalog.program.description && <p style={{ color: "#6b7280" }}>{catalog.program.description}</p>}

      {catalog.years.length === 0 && <p style={{ color: "#6b7280" }}>No years published for this program yet.</p>}

      {catalog.years.map((year) => (
        <section key={year._id} style={{ marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 20 }}>{year.yearName}</h2>
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

export default PublicCatalogScreen;
