import { Link, useParams } from "react-router-dom";

import { useGetPublicCatalogQuery } from "../../store/services/catalogApi";
import SubjectCard from "../../components/Guest/SubjectCard";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const PublicCatalogScreen = () => {
  const { programSlug } = useParams();
  const { data, isLoading, error } = useGetPublicCatalogQuery(programSlug);
  const catalog = data?.data;

  if (isLoading) return <div style={{ color: "var(--muted)" }}>Loading…</div>;
  if (error || !catalog) return <div style={{ padding: 24 }}>Program not found.</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Link to="/" style={{ color: "var(--primary)", fontSize: 14 }}>← Back to home</Link>
      <h1 style={{ color: "var(--primary)", marginTop: 8, marginBottom: 4 }}>{catalog.program.name}</h1>
      {catalog.program.description && <p style={{ color: "var(--muted)", maxWidth: 600 }}>{catalog.program.description}</p>}

      {catalog.years.length === 0 && <p style={{ color: "var(--muted)" }}>No years published for this program yet.</p>}

      {catalog.years.map((year) => (
        <section key={year._id} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>{year.yearName}</h2>
            {year.bundlePrice && (
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                Full-year bundle: <strong style={{ color: "#1C1C1C", fontFamily: "monospace" }}>{money(year.bundlePrice.discountedPrice)}</strong>
              </span>
            )}
          </div>
          {year.subjects.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No subjects published for this year yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
              {year.subjects.map((s) => <SubjectCard key={s._id} subject={s} />)}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default PublicCatalogScreen;
