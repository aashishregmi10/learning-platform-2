import { Skeleton } from "@mui/material";
import { WorkspacePremiumOutlined } from "@mui/icons-material";

import { useGetMyCertificatesQuery } from "../../../store/services/certificateApi";
import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import CertificateCard from "../../../components/Student/CertificateCard";
import PageHeader from "../../../components/Student/PageHeader";
import EmptyState from "../../../components/Student/EmptyState";

const CertificatesScreen = () => {
  const { data, isLoading } = useGetMyCertificatesQuery();
  const certificates = data?.data ?? [];

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Certificates" }]} isBusy={isLoading}>
      <div style={{ width: "100%" }}>
        <PageHeader eyebrow="Achievements" title="My Certificates" subtitle="Every subject you've completed, verified and shareable." />

        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))", gap: 18 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: "16px" }} />
            ))}
          </div>
        )}
        {!isLoading && certificates.length === 0 && (
          <EmptyState
            icon={<WorkspacePremiumOutlined fontSize="inherit" sx={{ color: "var(--student-gold)" }} />}
            title="Nothing here yet"
            subtitle="Complete every chapter of a subject to earn your first certificate."
          />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))", gap: 18 }}>
          {certificates.map((c) => (
            <CertificateCard key={c._id} certificate={c} />
          ))}
        </div>
      </div>
    </BreadcrumbLayout>
  );
};

export default CertificatesScreen;
