import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useLazyVerifyCertificateQuery } from "../../store/services/certificateApi";

const CertificateVerifyScreen = () => {
  const { number: paramNumber } = useParams();
  const [number, setNumber] = useState(paramNumber || "");
  const [trigger, { data, error, isFetching }] = useLazyVerifyCertificateQuery();

  useEffect(() => {
    if (paramNumber) trigger(paramNumber);
  }, [paramNumber, trigger]);

  const submit = (e) => {
    e.preventDefault();
    if (number.trim()) trigger(number.trim());
  };

  const cert = data?.data;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ color: "#1976d3" }}>Verify a Certificate</h1>
      <p style={{ color: "#6b7280" }}>Enter a certificate number to confirm it was issued by B.Sc Nepal.</p>

      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="e.g. BSC-CERT-2026-000001"
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #E7E0D4", fontFamily: "monospace" }}
        />
        <button
          type="submit"
          disabled={isFetching}
          style={{ background: "#1976d3", color: "#fff", border: 0, borderRadius: 6, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}
        >
          {isFetching ? "Checking…" : "Verify"}
        </button>
      </form>

      {error && (
        <div style={{ background: "#fdecea", border: "1px solid #e57373", borderRadius: 10, padding: "16px", color: "#b3261e" }}>
          {error?.data?.message || "No certificate found with that number."}
        </div>
      )}

      {cert && (
        <div style={{ border: "1px solid #66bb6a", background: "#defbe6", borderRadius: 10, padding: 20 }}>
          <div style={{ fontWeight: 700, color: "#2e7d32", marginBottom: 8 }}>✓ Valid Certificate</div>
          <dl style={{ margin: 0 }}>
            <dt style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase" }}>Certificate Number</dt>
            <dd style={{ margin: "0 0 10px", fontFamily: "monospace" }}>{cert.certificateNumber}</dd>
            <dt style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase" }}>Issued To</dt>
            <dd style={{ margin: "0 0 10px" }}>{cert.student}</dd>
            <dt style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase" }}>Subject</dt>
            <dd style={{ margin: "0 0 10px" }}>{cert.subject}</dd>
            <dt style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase" }}>Issued On</dt>
            <dd style={{ margin: 0 }}>{new Date(cert.issuedAt).toLocaleDateString()}</dd>
          </dl>
        </div>
      )}
    </div>
  );
};

export default CertificateVerifyScreen;
