const CertificateCard = ({ certificate }) => (
  <div
    style={{
      border: "1px solid #E7E0D4", borderRadius: 10, padding: 20,
      background: "linear-gradient(135deg, #FAF7F2 0%, #fff 100%)",
    }}
  >
    <div style={{ fontSize: 12, letterSpacing: 1, color: "#8C7B6B", textTransform: "uppercase" }}>
      Certificate of Completion
    </div>
    <h3 style={{ margin: "6px 0", color: "#2D5A3D" }}>{certificate.subject?.name}</h3>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
      <span style={{ fontFamily: "monospace", fontSize: 13, color: "#8C7B6B" }}>
        {certificate.certificateNumber}
      </span>
      <span style={{ fontSize: 13, color: "#8C7B6B" }}>
        {new Date(certificate.issuedAt).toLocaleDateString()}
      </span>
    </div>
  </div>
);

export default CertificateCard;
