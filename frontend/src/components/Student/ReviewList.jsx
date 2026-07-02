const Stars = ({ n }) => <span style={{ color: "#2D5A3D" }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
      {reviews.map((r) => (
        <div key={r._id} style={{ borderTop: "1px solid #E7E0D4", paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{r.student?.name || "Student"}</strong>
            <Stars n={r.rating} />
          </div>
          {r.comment && <p style={{ margin: "4px 0", color: "#1C1C1C" }}>{r.comment}</p>}
          <div style={{ color: "#8C7B6B", fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
          {r.response?.text && (
            <div style={{ marginTop: 6, background: "#FAF7F2", borderRadius: 6, padding: "8px 12px", fontSize: 14 }}>
              <strong>Instructor response:</strong> {r.response.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
