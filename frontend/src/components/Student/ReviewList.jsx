const Stars = ({ n }) => <span style={{ color: "var(--status-warning-fg)" }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
      {reviews.map((r) => (
        <div key={r._id} style={{ borderTop: "1px solid #D4D4D8", paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{r.student?.name || "Student"}</strong>
            <Stars n={r.rating} />
          </div>
          {r.comment && <p style={{ margin: "4px 0", color: "#171717" }}>{r.comment}</p>}
          <div style={{ color: "#71717A", fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
          {r.response?.text && (
            <div style={{ marginTop: 6, background: "#F7F7F8", borderRadius: 6, padding: "8px 12px", fontSize: 14 }}>
              <strong>Instructor response:</strong> {r.response.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
