import { Link, useNavigate, useParams } from "react-router-dom";

import { useGetSubjectBySlugQuery } from "../../store/services/subjectApi";
import { useGetSubjectContentQuery } from "../../store/services/catalogApi";
import { useGetSubjectReviewsQuery } from "../../store/services/reviewApi";
import { useAuth } from "../../hooks/useAuth";
import RatingSummary from "../../components/Student/RatingSummary";
import ReviewList from "../../components/Student/ReviewList";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const TYPE_LABEL = { video: "▶ Video", pdf: "📄 PDF", note: "📝 Note", link: "🔗 Link", audio: "🎧 Audio" };

// Public syllabus preview — read-only (no player/quiz/doubts). Anonymous
// visitors see lock badges and an "Enroll now" CTA; entitled visitors who
// happen to land here are pointed to the full authenticated view instead.
const PublicSubjectScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();

  const { data: subjectRes, isLoading: loadingSubject, error } = useGetSubjectBySlugQuery(slug);
  const subject = subjectRes?.data;

  const { data: contentRes, isLoading: loadingContent } = useGetSubjectContentQuery(subject?._id, { skip: !subject?._id });
  const chapters = contentRes?.data?.chapters ?? [];

  const { data: reviewsRes } = useGetSubjectReviewsQuery({ id: subject?._id }, { skip: !subject?._id });
  const reviewsData = reviewsRes?.data;

  const enroll = () => {
    if (isAuthenticated && isStudent) {
      navigate("/app/student/checkout", {
        state: {
          items: [{ itemType: "subject", subject: subject._id, title: subject.name, price: subject.pricing?.discountedPrice }],
        },
      });
    } else {
      navigate("/login");
    }
  };

  if (loadingSubject) return <div style={{ color: "#6b7280" }}>Loading…</div>;
  if (error || !subject) return <div style={{ padding: 24 }}>Subject not found.</div>;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <Link to={`/catalog/${subject.program?.slug}`} style={{ color: "#1976d3", fontSize: 14 }}>← Back to {subject.program?.name}</Link>
      <h1 style={{ color: "#1976d3", marginTop: 8 }}>{subject.name}</h1>
      <p style={{ color: "#6b7280" }}>{subject.year?.yearName} · {subject.category}</p>

      {subject.entitled ? (
        <div style={{ background: "#defbe6", border: "1px solid #66bb6a", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#2e7d32", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>✓ You're already enrolled in this subject.</span>
          <Link to={`/app/student/subjects/${subject._id}`} style={{ color: "#2e7d32", fontWeight: 600 }}>Continue learning →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#edf5ff", border: "1px solid #1976d3", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
          <span>Unlock every chapter, PDF, note and video in this subject.</span>
          <button onClick={enroll} style={{ background: "#1976d3", color: "#fff", border: 0, borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
            Enroll — {money(subject.pricing?.discountedPrice)}
          </button>
        </div>
      )}

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>What's inside</h2>
      {loadingContent && <p style={{ color: "#6b7280" }}>Loading syllabus…</p>}
      {chapters.map((ch) => (
        <section key={ch._id} style={{ marginBottom: 20, border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "#f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{ch.chapterNumber}. {ch.title}</strong>
            {ch.isFreePreview && <span style={{ fontSize: 12, color: "#1976d3", fontWeight: 600 }}>Free preview</span>}
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ch.items.map((item) => (
              <li key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "1px solid #eeeeee" }}>
                <span style={{ color: item.locked ? "#9e9e9e" : "#1C1C1C" }}>{TYPE_LABEL[item.type]} &nbsp; {item.title}</span>
                {item.locked ? (
                  <span title="Purchase required" style={{ color: "#9e9e9e", fontSize: 13 }}>🔒 Locked</span>
                ) : (
                  <span style={{ color: "#2D5A3D", fontSize: 13 }}>Free preview</span>
                )}
              </li>
            ))}
            {ch.items.length === 0 && <li style={{ padding: "10px 16px", color: "#6b7280" }}>No content yet.</li>}
            {ch.quizzes?.map((q) => (
              <li key={q._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "1px solid #eeeeee", background: "#fffdf5" }}>
                <span style={{ color: q.locked ? "#9e9e9e" : "#1C1C1C" }}>📝 Quiz &nbsp; {q.title}</span>
                {q.locked && <span title="Purchase required" style={{ color: "#9e9e9e", fontSize: 13 }}>🔒 Locked</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section style={{ marginTop: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Reviews</h2>
        <RatingSummary summary={reviewsData?.summary} />
        <ReviewList reviews={reviewsData?.reviews} />
      </section>
    </div>
  );
};

export default PublicSubjectScreen;
