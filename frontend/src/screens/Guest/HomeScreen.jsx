import { Link } from "react-router-dom";
import { Skeleton } from "@mui/material";
import {
  OndemandVideoOutlined, VideocamOutlined, QuizOutlined, PictureAsPdfOutlined,
  WorkspacePremiumOutlined, GroupsOutlined,
} from "@mui/icons-material";

import { useGetActiveProgramsQuery } from "../../store/services/programApi";
import { useGetPublicCatalogQuery } from "../../store/services/catalogApi";
import SubjectCard from "../../components/Guest/SubjectCard";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const FEATURES = [
  { icon: <OndemandVideoOutlined />, title: "Video Lessons", desc: "Chapter-by-chapter recordings you can watch anytime." },
  { icon: <VideocamOutlined />, title: "Live Classes", desc: "Join scheduled sessions with your subject teachers." },
  { icon: <QuizOutlined />, title: "Quizzes & Certificates", desc: "Test yourself after every chapter and earn a certificate." },
  { icon: <PictureAsPdfOutlined />, title: "Notes & PDFs", desc: "Downloadable notes written for the TU syllabus." },
];

const StatCard = ({ icon, value, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)" }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
    </div>
  </div>
);

const HomeScreen = () => {
  const { data: programsRes, isLoading: loadingPrograms } = useGetActiveProgramsQuery();
  const programs = programsRes?.data ?? [];
  // For now the platform covers a single B.Sc program — no other programs
  // launch until next year — so the homepage IS that program's catalog.
  const primaryProgram = programs[0];

  const { data: catalogRes, isLoading: loadingCatalog } = useGetPublicCatalogQuery(primaryProgram?.slug, { skip: !primaryProgram });
  const catalog = catalogRes?.data;

  const totalSubjects = catalog?.years.reduce((sum, y) => sum + y.subjects.length, 0) ?? 0;
  const totalChapters = catalog?.years.reduce((sum, y) => sum + y.subjects.reduce((s, sub) => s + (sub.totalChapters || 0), 0), 0) ?? 0;

  if (loadingPrograms) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: "20px", mb: 4 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: "14px" }} />
          ))}
        </div>
        <Skeleton variant="text" width={160} height={32} sx={{ mb: 2 }} />
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={230} sx={{ borderRadius: "14px" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!primaryProgram) {
    return (
      <div style={{ maxWidth: 700, margin: "80px auto", textAlign: "center" }}>
        <h1 style={{ color: "var(--primary)" }}>B.Sc Nepal</h1>
        <p style={{ color: "var(--muted)" }}>We're setting up the catalog — check back soon.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Hero */}
      <section
        style={{
          borderRadius: 20, overflow: "hidden", marginBottom: 48,
          background: "linear-gradient(120deg, #10365e 0%, #1976d3 55%, #2D5A3D 130%)",
          padding: "48px 40px", display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 380px" }}>
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
            {primaryProgram.code || "B.Sc"} · Tribhuvan University Syllabus
          </span>
          <h1 style={{ color: "#fff", fontSize: 38, margin: "10px 0 14px", lineHeight: 1.2 }}>
            Everything you need to pass {primaryProgram.name}.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, marginBottom: 24, maxWidth: 480 }}>
            {primaryProgram.description ||
              `Notes, recorded lessons, live classes and quizzes for every subject in ${primaryProgram.name} — built around the actual TU curriculum, year by year.`}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#catalog" style={{ textDecoration: "none", background: "#fff", color: "var(--primary)", fontWeight: 700, borderRadius: 8, padding: "12px 22px" }}>
              Explore the Program
            </a>
            <Link to="/verify" style={{ textDecoration: "none", background: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: 700, borderRadius: 8, padding: "12px 22px", border: "1px solid rgba(255,255,255,0.4)" }}>
              Verify a Certificate
            </Link>
          </div>
        </div>

        <div style={{ flex: "1 1 260px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <StatCard icon={<GroupsOutlined />} value={primaryProgram.durationYears} label="years covered" />
          <StatCard icon={<WorkspacePremiumOutlined />} value={totalSubjects || "—"} label="subjects" />
          <StatCard icon={<OndemandVideoOutlined />} value={totalChapters || "—"} label="chapters" />
          <StatCard icon={<QuizOutlined />} value="Quizzes" label="+ certificates" />
        </div>
      </section>

      {/* Features */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 56 }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 20, background: "#fff" }}>
            <div style={{ color: "var(--primary)", marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{f.desc}</div>
          </div>
        ))}
      </section>

      {/* Program catalog */}
      <section id="catalog" style={{ scrollMarginTop: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ color: "var(--primary)", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>The Program</span>
          <h2 style={{ margin: "4px 0 0", fontSize: 26 }}>{primaryProgram.name} — Year by Year</h2>
        </div>

        {loadingCatalog && (
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={230} sx={{ borderRadius: "14px" }} />
            ))}
          </div>
        )}
        {catalog?.years.length === 0 && <p style={{ color: "var(--muted)" }}>No years published yet — check back soon.</p>}

        {catalog?.years.map((year) => (
          <div key={year._id} style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>{year.yearName}</h3>
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
          </div>
        ))}
      </section>

      {/* Closing CTA */}
      <section
        style={{
          textAlign: "center", padding: "40px 24px", borderRadius: 16, marginBottom: 40,
          background: "var(--primary-accent)", border: "1px solid var(--border)",
        }}
      >
        <h2 style={{ margin: "0 0 8px" }}>Ready to start learning?</h2>
        <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>Create an account to enroll, track your progress and earn certificates.</p>
        <Link to="/login" style={{ textDecoration: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, borderRadius: 8, padding: "12px 28px" }}>
          Sign in to enroll
        </Link>
      </section>
    </div>
  );
};

export default HomeScreen;
