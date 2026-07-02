import { useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";
import { SchoolOutlined, WorkspacePremiumOutlined, MenuBookOutlined } from "@mui/icons-material";

import { useGetMyCatalogQuery } from "../../../store/services/catalogApi";
import { useGetMyCertificatesQuery } from "../../../store/services/certificateApi";
import { useAuth } from "../../../hooks/useAuth";
import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import PageHeader from "../../../components/Student/PageHeader";
import SubjectCard from "../../../components/Student/SubjectCard";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const HeaderStat = ({ icon, value, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.15)" }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, opacity: 0.8 }}>{label}</div>
    </div>
  </div>
);

const CatalogSkeleton = () => (
  <div style={{ width: "100%" }}>
    <Skeleton variant="rounded" height={130} sx={{ borderRadius: "16px", mb: 4 }} />
    <Skeleton variant="text" width={140} height={32} sx={{ mb: 2 }} />
    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={230} sx={{ borderRadius: "14px" }} />
      ))}
    </div>
  </div>
);

const StudentCatalogScreen = () => {
  const navigate = useNavigate();
  const { loggedInUser } = useAuth();
  const { data, isLoading } = useGetMyCatalogQuery();
  const { data: certRes } = useGetMyCertificatesQuery();
  const catalog = data?.data;
  const certificateCount = certRes?.data?.length ?? 0;

  const enrolledCount = catalog?.years.reduce(
    (sum, y) => sum + y.subjects.filter((s) => s.entitled).length,
    0
  ) ?? 0;

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

  if (isLoading) return <CatalogSkeleton />;

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Catalog" }]}>
      <div style={{ width: "100%" }}>
        {!catalog?.program ? (
          <div style={{ padding: 24 }}>
            <h2 style={{ color: "var(--student-ink)" }}>Welcome to B.Sc Nepal</h2>
            <p style={{ color: "var(--muted)" }}>No program is assigned to your account yet. Once enrolled, your years and subjects show up here.</p>
          </div>
        ) : (
          <>
            <PageHeader
              eyebrow="Your Program"
              title={`Welcome back, ${loggedInUser?.name?.split(" ")[0] || "there"} 👋`}
              subtitle={catalog.program.name}
              right={
                <div style={{ display: "flex", gap: 24 }}>
                  <HeaderStat icon={<SchoolOutlined fontSize="small" />} value={enrolledCount} label="enrolled" />
                  <HeaderStat icon={<WorkspacePremiumOutlined fontSize="small" />} value={certificateCount} label="certificates" />
                </div>
              }
            />

            {catalog.years.map((year) => (
              <section key={year._id} style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MenuBookOutlined sx={{ color: "var(--student-ink-2)", fontSize: 20 }} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: 20 }}>{year.yearName}</h2>
                  </div>
                  <button
                    onClick={() => buyYear(year)}
                    style={{ background: "linear-gradient(120deg, var(--student-ink) 0%, var(--student-ink-2) 100%)", color: "#fff", border: 0, borderRadius: 999, padding: "9px 20px", cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 12px rgba(47,111,237,0.3)" }}
                  >
                    Buy bundle — {money(year.bundlePrice?.discountedPrice)}
                  </button>
                </div>
                {year.subjects.length === 0 ? (
                  <p style={{ color: "var(--muted)" }}>No subjects published for this year yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))" }}>
                    {year.subjects.map((s) => <SubjectCard key={s._id} subject={s} />)}
                  </div>
                )}
              </section>
            ))}
          </>
        )}
      </div>
    </BreadcrumbLayout>
  );
};

export default StudentCatalogScreen;
