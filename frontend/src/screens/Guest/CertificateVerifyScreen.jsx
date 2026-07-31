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
      <h1 style={{ color: "#171717" }}>Verify a Certificate</h1>
      <p style={{ color: "#71717A" }}>Enter a certificate number to confirm it was issued by B.Sc Nepal.</p>

      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="e.g. BSC-CERT-2026-000001"
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #D4D4D8", fontFamily: "monospace" }}
        />
        <button
          type="submit"
          disabled={isFetching}
          style={{ background: "var(--primary)", color: "#fff", border: 0, borderRadius: 6, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}
        >
          {isFetching ? "Checking…" : "Verify"}
        </button>
      </form>

      {error && (
        <div style={{ background: "var(--status-danger-bg)", border: "1px solid var(--status-danger-solid)", borderRadius: 10, padding: "16px", color: "var(--status-danger-fg)" }}>
          {error?.data?.message || "No certificate found with that number."}
        </div>
      )}

      {cert && (
        <div style={{ border: "1px solid var(--status-success-solid)", background: "var(--status-success-bg)", borderRadius: 10, padding: 20 }}>
          <div style={{ fontWeight: 700, color: "var(--status-success-fg)", marginBottom: 8 }}>✓ Valid Certificate</div>
          <dl style={{ margin: 0 }}>
            <dt style={{ fontSize: 12, color: "#71717A", textTransform: "uppercase" }}>Certificate Number</dt>
            <dd style={{ margin: "0 0 10px", fontFamily: "monospace" }}>{cert.certificateNumber}</dd>
            <dt style={{ fontSize: 12, color: "#71717A", textTransform: "uppercase" }}>Issued To</dt>
            <dd style={{ margin: "0 0 10px" }}>{cert.student}</dd>
            <dt style={{ fontSize: 12, color: "#71717A", textTransform: "uppercase" }}>Subject</dt>
            <dd style={{ margin: "0 0 10px" }}>{cert.subject}</dd>
            <dt style={{ fontSize: 12, color: "#71717A", textTransform: "uppercase" }}>Issued On</dt>
            <dd style={{ margin: 0 }}>{new Date(cert.issuedAt).toLocaleDateString()}</dd>
          </dl>
        </div>
      )}
    </div>
  );
};

export default CertificateVerifyScreen;
