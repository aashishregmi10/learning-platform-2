import { useGetMyCertificatesQuery } from "../../../store/services/certificateApi";
import CertificateCard from "../../../components/Student/CertificateCard";

const CertificatesScreen = () => {
  const { data, isLoading } = useGetMyCertificatesQuery();
  const certificates = data?.data ?? [];

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ color: "#1976d3" }}>My Certificates</h1>

      {isLoading && <div style={{ color: "#6b7280" }}>Loading…</div>}
      {!isLoading && certificates.length === 0 && (
        <p style={{ color: "#8C7B6B" }}>
          Nothing here yet — complete a subject to earn your first certificate.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {certificates.map((c) => (
          <CertificateCard key={c._id} certificate={c} />
        ))}
      </div>
    </div>
  );
};

export default CertificatesScreen;
