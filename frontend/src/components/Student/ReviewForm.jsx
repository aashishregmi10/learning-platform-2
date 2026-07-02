import { useState } from "react";
import { toast } from "react-toastify";

import { useCreateReviewMutation } from "../../store/services/reviewApi";

const ReviewForm = ({ subjectId, onDone }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const submit = async () => {
    try {
      await createReview({ targetType: "subject", subject: subjectId, rating, comment }).unwrap();
      toast.success("Review posted");
      setComment("");
      onDone?.();
    } catch (err) {
      toast.error(err?.data?.message || "Could not post review");
    }
  };

  return (
    <div style={{ border: "1px solid #E7E0D4", borderRadius: 10, padding: 16 }}>
      <div style={{ marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setRating(n)}
            style={{ cursor: "pointer", fontSize: 22, color: n <= rating ? "#2D5A3D" : "#E7E0D4" }}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was this subject? (optional)"
        rows={2}
        style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #E7E0D4", fontFamily: "inherit", resize: "vertical" }}
      />
      <button
        onClick={submit}
        disabled={isLoading}
        style={{ marginTop: 8, background: "#2D5A3D", color: "#fff", border: 0, borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}
      >
        {isLoading ? "Posting…" : "Post review"}
      </button>
    </div>
  );
};

export default ReviewForm;
