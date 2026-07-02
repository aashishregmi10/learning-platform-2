import { Link } from "react-router-dom";

import { useGetActiveProgramsQuery } from "../../store/services/programApi";

const ProgramCard = ({ program }) => (
  <Link
    to={`/catalog/${program.slug}`}
    style={{
      textDecoration: "none", border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden",
      background: "#fff", display: "flex", flexDirection: "column",
    }}
  >
    <div style={{ height: 96, background: "linear-gradient(135deg,#1976d3,#1565c0)", display: "flex", alignItems: "flex-end", padding: 16 }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>{program.name}</span>
    </div>
    <div style={{ padding: 16 }}>
      <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>{program.durationYears}-year program</p>
      <span style={{ color: "#1976d3", fontWeight: 600, fontSize: 14 }}>Explore courses →</span>
    </div>
  </Link>
);

const HomeScreen = () => {
  const { data, isLoading } = useGetActiveProgramsQuery();
  const programs = data?.data ?? [];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <section style={{ textAlign: "center", padding: "40px 0 56px" }}>
        <h1 style={{ fontSize: 36, color: "#1C1C1C", margin: "0 0 12px" }}>
          Learn from Nepal's B.Sc curriculum, taught right.
        </h1>
        <p style={{ color: "#6b7280", fontSize: 17, maxWidth: 600, margin: "0 auto" }}>
          Notes, videos, live classes and quizzes for every subject — pick your program below to see what's inside.
        </p>
      </section>

      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Programs</h2>
      {isLoading && <p style={{ color: "#6b7280" }}>Loading…</p>}
      {!isLoading && programs.length === 0 && <p style={{ color: "#6b7280" }}>No programs published yet — check back soon.</p>}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {programs.map((p) => <ProgramCard key={p._id} program={p} />)}
      </div>
    </div>
  );
};

export default HomeScreen;
