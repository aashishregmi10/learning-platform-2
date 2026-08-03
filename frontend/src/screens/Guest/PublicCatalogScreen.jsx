import { Link, useParams } from "react-router-dom";
import { Skeleton } from "@mui/material";

import { useGetPublicCatalogQuery } from "../../store/services/catalogApi";
import { tokens } from "../../theme";
import SubjectCard from "../../components/Guest/SubjectCard";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const SUBJECT_GRID = {
  display: "grid",
  gap: 20,
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
};

const PublicCatalogScreen = () => {
  const { programSlug } = useParams();
  const { data, isLoading, error } = useGetPublicCatalogQuery(programSlug);
  const catalog = data?.data;

  if (isLoading) {
    return (
      <>
        <div className="band band--ink">
          <div className="page" style={{ paddingBlock: 56 }}>
            <Skeleton variant="text" width={300} height={48} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
            <Skeleton variant="text" width="45%" height={26} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
          </div>
        </div>
        <div className="page" style={{ paddingBlock: 48 }}>
          <div style={SUBJECT_GRID}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={230} sx={{ borderRadius: "14px" }} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error || !catalog) {
    return (
      <div className="page" style={{ paddingBlock: 100, textAlign: "center" }}>
        <h1 style={{ marginBottom: 8 }}>Program not found</h1>
        <p style={{ color: tokens.muted, marginBottom: 20 }}>
          That link doesn&apos;t point at anything we publish.
        </p>
        <Link to="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="band band--ink">
        <div className="page" style={{ paddingBlock: 56 }}>
          <Link
            to="/"
            style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, textDecoration: "none" }}
          >
            ← Back to home
          </Link>
          <h1
            style={{
              color: "#fff",
              margin: "14px 0 8px",
              fontSize: "clamp(28px, 3.4vw, 40px)",
              letterSpacing: "-0.02em",
            }}
          >
            {catalog.program.name}
          </h1>
          {catalog.program.description && (
            <p style={{ color: "rgba(255,255,255,0.85)", maxWidth: 680, margin: 0, lineHeight: 1.6 }}>
              {catalog.program.description}
            </p>
          )}
        </div>
      </section>

      <div className="page" style={{ paddingBlock: 56 }}>
        {catalog.years.length === 0 && (
          <p style={{ color: tokens.muted }}>No years published for this program yet.</p>
        )}

        {catalog.years.map((year) => (
          <section key={year._id} style={{ marginBottom: 48 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
                flexWrap: "wrap",
                paddingBottom: 12,
                marginBottom: 20,
                borderBottom: `1px solid ${tokens.border}`,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 21, letterSpacing: "-0.01em" }}>{year.yearName}</h2>
              {year.bundlePrice && (
                <span style={{ fontSize: 13, color: tokens.muted }}>
                  Full-year bundle:{" "}
                  <strong style={{ color: tokens.ink, fontFamily: "monospace" }}>
                    {money(year.bundlePrice.discountedPrice)}
                  </strong>
                </span>
              )}
            </div>
            {year.subjects.length === 0 ? (
              <p style={{ color: tokens.muted }}>No subjects published for this year yet.</p>
            ) : (
              <div style={SUBJECT_GRID}>
                {year.subjects.map((s) => (
                  <SubjectCard key={s._id} subject={s} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
};

export default PublicCatalogScreen;
