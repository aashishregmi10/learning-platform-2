const RatingSummary = ({ summary }) => {
  if (!summary || summary.count === 0) {
    return <p style={{ color: "#8C7B6B", fontSize: 14 }}>No reviews yet — be the first to rate this subject.</p>;
  }
  const { average, count, distribution } = summary;

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, fontFamily: "monospace", fontWeight: 700 }}>{average}</div>
        <div style={{ color: "#8C7B6B", fontSize: 13 }}>{count} review{count !== 1 ? "s" : ""}</div>
      </div>
      <div style={{ flex: 1, minWidth: 180 }}>
        {[5, 4, 3, 2, 1].map((star) => {
          const n = distribution[star] || 0;
          const pct = count ? Math.round((n / count) * 100) : 0;
          return (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 3 }}>
              <span style={{ width: 12 }}>{star}★</span>
              <div style={{ flex: 1, height: 6, background: "#E7E0D4", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#2D5A3D" }} />
              </div>
              <span style={{ width: 24, color: "#8C7B6B" }}>{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSummary;
