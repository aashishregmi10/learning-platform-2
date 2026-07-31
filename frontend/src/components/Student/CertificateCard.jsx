import { WorkspacePremiumOutlined } from "@mui/icons-material";

import InfoCard from "./InfoCard";

const CertificateCard = ({ certificate }) => (
  <InfoCard
    href={`/verify/${certificate.certificateNumber}`}
    pills={[{ label: "Certified", role: "success" }]}
    icon={<WorkspacePremiumOutlined sx={{ fontSize: 34, color: "var(--status-success-solid)" }} />}
    title={certificate.subject?.name}
    meta={<span style={{ fontSize: 12, color: "var(--muted)" }}>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</span>}
    footerLeft={<span style={{ fontFamily: "monospace" }}>{certificate.certificateNumber}</span>}
    footerRight="View & verify →"
    footerRole="success"
  />
);

export default CertificateCard;
