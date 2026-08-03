import { Link } from "react-router-dom";
import { Skeleton } from "@mui/material";
import {
  OndemandVideoOutlined,
  VideocamOutlined,
  QuizOutlined,
  PictureAsPdfOutlined,
  MenuBookOutlined,
  LayersOutlined,
  CalendarMonthOutlined,
} from "@mui/icons-material";

import { useGetActiveProgramsQuery } from "../../store/services/programApi";
import { useGetPublicCatalogQuery } from "../../store/services/catalogApi";
import { tokens } from "../../theme";
import SubjectCard from "../../components/Guest/SubjectCard";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const FEATURES = [
  {
    icon: <OndemandVideoOutlined />,
    title: "Video lessons",
    desc: "Chapter-by-chapter recordings you can watch anytime, at your own pace.",
  },
  {
    icon: <VideocamOutlined />,
    title: "Live classes",
    desc: "Scheduled sessions with your subject teachers, plus recordings afterwards.",
  },
  {
    icon: <QuizOutlined />,
    title: "Chapter quizzes",
    desc: "Check what actually landed after every chapter, before the exam does.",
  },
  {
    icon: <PictureAsPdfOutlined />,
    title: "Notes & PDFs",
    desc: "Downloadable notes written against the TU syllabus, not a generic one.",
  },
];

const SUBJECT_GRID = {
  display: "grid",
  gap: 20,
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
};

const HeroStat = ({ icon, value, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 12,
        background: "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.82, marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

const HomeScreen = () => {
  const { data: programsRes, isLoading: loadingPrograms } = useGetActiveProgramsQuery();
  const programs = programsRes?.data ?? [];
  // For now the platform covers a single B.Sc program — no other programs
  // launch until next year — so the homepage IS that program's catalog.
  const primaryProgram = programs[0];

  const { data: catalogRes, isLoading: loadingCatalog } = useGetPublicCatalogQuery(
    primaryProgram?.slug,
    { skip: !primaryProgram }
  );
  const catalog = catalogRes?.data;

  const totalSubjects = catalog?.years.reduce((sum, y) => sum + y.subjects.length, 0) ?? 0;
  const totalChapters =
    catalog?.years.reduce(
      (sum, y) => sum + y.subjects.reduce((s, sub) => s + (sub.totalChapters || 0), 0),
      0
    ) ?? 0;

  if (loadingPrograms) {
    return (
      <>
        <div className="band band--ink">
          <div className="page" style={{ paddingBlock: 72 }}>
            <Skeleton variant="text" width={240} height={28} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
            <Skeleton variant="text" width="60%" height={62} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
            <Skeleton variant="text" width="42%" height={28} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
          </div>
        </div>
        <div className="page" style={{ paddingBlock: 56 }}>
          <div style={SUBJECT_GRID}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={230} sx={{ borderRadius: "14px" }} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!primaryProgram) {
    return (
      <div className="page" style={{ paddingBlock: 120, textAlign: "center" }}>
        <h1 style={{ color: "var(--primary)", marginBottom: 8 }}>B.Sc Nepal</h1>
        <p style={{ color: tokens.muted }}>We&apos;re setting up the catalog — check back soon.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero — full-bleed band, content capped by .page */}
      <section className="band band--ink">
        <div
          className="page"
          style={{
            paddingBlock: 76,
            display: "grid",
            gap: 48,
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.6,
                textTransform: "uppercase",
              }}
            >
              {primaryProgram.code || "B.Sc"} · Tribhuvan University syllabus
            </span>
            <h1
              style={{
                color: "#fff",
                fontSize: "clamp(32px, 4vw, 48px)",
                margin: "14px 0 16px",
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
              }}
            >
              Everything you need to pass {primaryProgram.name}.
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.88)",
                fontSize: 17,
                lineHeight: 1.6,
                marginBottom: 28,
                maxWidth: 560,
              }}
            >
              {primaryProgram.description ||
                `Notes, recorded lessons, live classes and quizzes for every subject in ${primaryProgram.name} — built around the actual TU curriculum, year by year.`}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="#catalog"
                style={{
                  textDecoration: "none",
                  background: "#fff",
                  color: "var(--primary-strong)",
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: "13px 26px",
                }}
              >
                Explore the program
              </a>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: "13px 26px",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                Sign in to enroll
              </Link>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
            <HeroStat
              icon={<CalendarMonthOutlined />}
              value={primaryProgram.durationYears}
              label="years covered"
            />
            <HeroStat icon={<MenuBookOutlined />} value={totalSubjects || "—"} label="subjects" />
            <HeroStat icon={<LayersOutlined />} value={totalChapters || "—"} label="chapters" />
            <HeroStat icon={<VideocamOutlined />} value="Live" label="weekly classes" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="band band--tint">
        <div
          className="page"
          style={{
            paddingBlock: 44,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div style={{ color: "var(--primary)", marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 5 }}>{f.title}</div>
              <div style={{ color: tokens.muted, fontSize: 14, lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Program catalog */}
      <section id="catalog" style={{ scrollMarginTop: 80 }}>
        <div className="page" style={{ paddingBlock: 64 }}>
          <div style={{ marginBottom: 32 }}>
            <span
              style={{
                color: "var(--primary)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              The program
            </span>
            <h2 style={{ margin: "6px 0 0", fontSize: 30, letterSpacing: "-0.02em" }}>
              {primaryProgram.name} — year by year
            </h2>
          </div>

          {loadingCatalog && (
            <div style={SUBJECT_GRID}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={230} sx={{ borderRadius: "14px" }} />
              ))}
            </div>
          )}
          {catalog?.years.length === 0 && (
            <p style={{ color: tokens.muted }}>No years published yet — check back soon.</p>
          )}

          {catalog?.years.map((year) => (
            <div key={year._id} style={{ marginBottom: 48 }}>
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
                <h3 style={{ margin: 0, fontSize: 21, letterSpacing: "-0.01em" }}>{year.yearName}</h3>
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
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="band band--tint">
        <div className="page" style={{ paddingBlock: 56, textAlign: "center" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 26, letterSpacing: "-0.02em" }}>
            Ready to start learning?
          </h2>
          <p style={{ color: tokens.muted, margin: "0 0 24px" }}>
            Create an account to enroll, unlock every chapter and track your progress.
          </p>
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              background: "var(--primary)",
              color: "#fff",
              fontWeight: 700,
              borderRadius: 8,
              padding: "13px 30px",
            }}
          >
            Sign in to enroll
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomeScreen;
