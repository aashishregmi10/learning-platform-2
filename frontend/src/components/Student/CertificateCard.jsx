import { WorkspacePremiumOutlined } from "@mui/icons-material";

import InfoCard from "./InfoCard";

const CertificateCard = ({ certificate }) => (
  <InfoCard
    href={`/verify/${certificate.certificateNumber}`}
    pills={[{ label: "Certified", tone: "solid", color: "var(--student-gold)" }]}
    icon={<WorkspacePremiumOutlined sx={{ fontSize: 34, color: "var(--student-gold)" }} />}
    title={certificate.subject?.name}
    meta={<span style={{ fontSize: 12, color: "var(--muted)" }}>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</span>}
    footerLeft={<span style={{ fontFamily: "monospace" }}>{certificate.certificateNumber}</span>}
    footerRight="View & verify →"
    footerColor="var(--student-gold)"
  />
);

export default CertificateCard;
