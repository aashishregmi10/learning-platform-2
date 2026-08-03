import { Link, useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@mui/material";
import {
  ArticleOutlined,
  HeadphonesOutlined,
  LinkOutlined,
  LockOutlined,
  OndemandVideoOutlined,
  PictureAsPdfOutlined,
  QuizOutlined,
} from "@mui/icons-material";

import { useGetSubjectBySlugQuery } from "../../store/services/subjectApi";
import { useGetSubjectContentQuery } from "../../store/services/catalogApi";
import { useGetSubjectReviewsQuery } from "../../store/services/reviewApi";
import { useAuth } from "../../hooks/useAuth";
import { tokens } from "../../theme";
import RatingSummary from "../../components/Student/RatingSummary";
import ReviewList from "../../components/Student/ReviewList";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const TYPE_ICON = {
  video: OndemandVideoOutlined,
  pdf: PictureAsPdfOutlined,
  note: ArticleOutlined,
  link: LinkOutlined,
  audio: HeadphonesOutlined,
};

const ItemRow = ({ icon: Icon, title, locked, free, tinted }) => (
  <li
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      padding: "11px 18px",
      borderTop: `1px solid ${tokens.border}`,
      background: tinted ? tokens.surfaceMuted : "transparent",
    }}
  >
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: locked ? tokens.faint : tokens.ink,
        fontSize: 14,
        minWidth: 0,
      }}
    >
      <Icon sx={{ fontSize: 18, color: locked ? "var(--faint)" : "var(--primary)", flexShrink: 0 }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {title}
      </span>
    </span>
    {locked ? (
      <LockOutlined titleAccess="Purchase required" sx={{ fontSize: 16, color: "var(--faint)" }} />
    ) : free ? (
      <span style={{ color: "var(--status-success-fg)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
        Free preview
      </span>
    ) : null}
  </li>
);

// Public syllabus preview — read-only (no player/quiz/doubts). Anonymous
// visitors see lock badges and an "Enroll now" CTA; entitled visitors who
// happen to land here are pointed to the full authenticated view instead.
const PublicSubjectScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();

  const { data: subjectRes, isLoading: loadingSubject, error } = useGetSubjectBySlugQuery(slug);
  const subject = subjectRes?.data;

  const { data: contentRes, isLoading: loadingContent } = useGetSubjectContentQuery(subject?._id, {
    skip: !subject?._id,
  });
  const chapters = contentRes?.data?.chapters ?? [];

  const { data: reviewsRes } = useGetSubjectReviewsQuery(
    { id: subject?._id },
    { skip: !subject?._id }
  );
  const reviewsData = reviewsRes?.data;

  const enroll = () => {
    if (isAuthenticated && isStudent) {
      navigate("/app/student/checkout", {
        state: {
          items: [
            {
              itemType: "subject",
              subject: subject._id,
              title: subject.name,
              price: subject.pricing?.discountedPrice,
            },
          ],
        },
      });
    } else {
      navigate("/login");
    }
  };

  if (loadingSubject) {
    return (
      <>
        <div className="band band--ink">
          <div className="page" style={{ paddingBlock: 52 }}>
            <Skeleton variant="text" width={320} height={46} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
            <Skeleton variant="text" width={220} height={24} sx={{ bgcolor: "rgba(255,255,255,0.18)" }} />
          </div>
        </div>
        <div className="page" style={{ paddingBlock: 44 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={92} sx={{ borderRadius: "12px", mb: 2 }} />
          ))}
        </div>
      </>
    );
  }

  if (error || !subject) {
    return (
      <div className="page" style={{ paddingBlock: 100, textAlign: "center" }}>
        <h1 style={{ marginBottom: 8 }}>Subject not found</h1>
        <p style={{ color: tokens.muted, marginBottom: 20 }}>
          That link doesn&apos;t point at anything we publish.
        </p>
        <Link to="/" style={{ color: "var(--primary)", fontWeight: 600 }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  const totalItems = chapters.reduce(
    (n, ch) => n + (ch.items?.length ?? 0) + (ch.quizzes?.length ?? 0),
    0
  );

  return (
    <>
      <section className="band band--ink">
        <div className="page" style={{ paddingBlock: 52 }}>
          <Link
            to={`/catalog/${subject.program?.slug}`}
            style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, textDecoration: "none" }}
          >
            ← Back to {subject.program?.name}
          </Link>
          <span
            style={{
              display: "inline-block",
              marginTop: 16,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 20,
              padding: "4px 13px",
            }}
          >
            {subject.category}
          </span>
          <h1
            style={{
              margin: "12px 0 6px",
              fontSize: "clamp(28px, 3.4vw, 40px)",
              letterSpacing: "-0.02em",
            }}
          >
            {subject.name}
          </h1>
          <p style={{ margin: 0, opacity: 0.85 }}>
            {subject.year?.yearName} · {subject.program?.name}
            {totalItems > 0 ? ` · ${chapters.length} chapters · ${totalItems} items` : ""}
          </p>
        </div>
      </section>

      {/* Syllabus + sticky enroll rail. Two columns are what keep this page
          from reading as a narrow strip on a desktop screen. */}
      <div
        className="page"
        style={{
          paddingBlock: 48,
          display: "grid",
          gap: 40,
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 20, marginTop: 0, marginBottom: 16, letterSpacing: "-0.01em" }}>
            What&apos;s inside
          </h2>

          {loadingContent &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={92} sx={{ borderRadius: "12px", mb: 2 }} />
            ))}

          {!loadingContent && chapters.length === 0 && (
            <p style={{ color: tokens.muted }}>The syllabus for this subject is still being built.</p>
          )}

          {chapters.map((ch) => (
            <section
              key={ch._id}
              style={{
                marginBottom: 16,
                border: `1px solid ${tokens.border}`,
                borderRadius: 12,
                overflow: "hidden",
                background: tokens.surface,
              }}
            >
              <div
                style={{
                  padding: "13px 18px",
                  background: tokens.surfaceMuted,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <strong style={{ fontSize: 15 }}>
                  {ch.chapterNumber}. {ch.title}
                </strong>
                {ch.isFreePreview && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--status-success-fg)",
                      background: "var(--status-success-bg)",
                      borderRadius: 6,
                      padding: "3px 9px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Free preview
                  </span>
                )}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {ch.items.map((item) => (
                  <ItemRow
                    key={item._id}
                    icon={TYPE_ICON[item.type] ?? ArticleOutlined}
                    title={item.title}
                    locked={item.locked}
                    // Only genuinely free items say so — an enrolled visitor
                    // shouldn't see "Free preview" stamped on the whole subject.
                    free={item.isFree}
                  />
                ))}
                {ch.items.length === 0 && (
                  <li style={{ padding: "11px 18px", color: tokens.muted, fontSize: 14 }}>
                    No content yet.
                  </li>
                )}
                {ch.quizzes?.map((q) => (
                  <ItemRow key={q._id} icon={QuizOutlined} title={q.title} locked={q.locked} tinted />
                ))}
              </ul>
            </section>
          ))}

          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, marginBottom: 14, letterSpacing: "-0.01em" }}>Reviews</h2>
            <RatingSummary summary={reviewsData?.summary} />
            <ReviewList reviews={reviewsData?.reviews} />
          </section>
        </div>

        <aside style={{ position: "sticky", top: 88 }}>
          {subject.entitled ? (
            <div
              style={{
                border: "1px solid var(--status-success-solid)",
                background: "var(--status-success-bg)",
                borderRadius: 14,
                padding: 22,
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--status-success-fg)", marginBottom: 6 }}>
                You&apos;re enrolled
              </div>
              <p style={{ color: "var(--status-success-fg)", fontSize: 14, margin: "0 0 16px" }}>
                Every chapter in this subject is already unlocked for you.
              </p>
              <Link
                to={`/app/student/subjects/${subject._id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                  background: "var(--status-success-solid)",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: "11px 0",
                }}
              >
                Continue learning →
              </Link>
            </div>
          ) : (
            <div
              style={{
                border: `1px solid ${tokens.border}`,
                borderRadius: 14,
                padding: 22,
                background: tokens.surface,
              }}
            >
              <div style={{ fontSize: 12, color: tokens.muted, marginBottom: 4 }}>One-time price</div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}
              >
                {money(subject.pricing?.discountedPrice)}
              </div>
              {subject.pricing?.originalPrice > subject.pricing?.discountedPrice && (
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                    color: tokens.faint,
                    textDecoration: "line-through",
                    marginBottom: 12,
                  }}
                >
                  {money(subject.pricing.originalPrice)}
                </div>
              )}
              <p style={{ color: tokens.muted, fontSize: 14, lineHeight: 1.55, margin: "12px 0 18px" }}>
                Unlock every chapter, PDF, note, video and quiz in this subject.
              </p>
              <button
                onClick={enroll}
                style={{
                  width: "100%",
                  background: "var(--primary)",
                  color: "#fff",
                  border: 0,
                  borderRadius: 8,
                  padding: "12px 0",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Enroll now
              </button>
              <div style={{ marginTop: 14, fontSize: 12.5, color: tokens.muted, lineHeight: 1.9 }}>
                <div>✓ {chapters.length} chapters</div>
                <div>✓ Lifetime access to this subject</div>
                <div>✓ Live classes with your teacher</div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default PublicSubjectScreen;
