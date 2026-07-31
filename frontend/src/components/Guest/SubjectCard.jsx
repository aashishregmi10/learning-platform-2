import { Link } from "react-router-dom";

import { tokens } from "../../theme";
import { getSubjectImage, getSubjectIcon } from "../../utils/subjectVisuals";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

// Richer public-facing subject card — cover image, category chip, star
// rating (when reviewed), price + chapter count. The category chip used to
// pick a colour per category; category carries no good/bad meaning, so it's
// grey now and the cover stays a neutral ink wash.
const SubjectCard = ({ subject }) => {
  const uploadedImage = subject.thumbnail;
  const image = uploadedImage || getSubjectImage(subject.name);
  const Icon = getSubjectIcon(subject.name);

  return (
    <Link
      to={`/subjects/${subject.slug}`}
      className="guest-card"
      style={{
        textDecoration: "none", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden",
        background: "#fff", display: "flex", flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 110, background: `linear-gradient(135deg, ${tokens.body}, ${tokens.ink})`,
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={subject.name}
            style={uploadedImage
              ? { width: "100%", height: "100%", objectFit: "cover" }
              : { width: "80%", height: "90%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon sx={{ fontSize: 30, color: "rgba(255,255,255,0.9)" }} />
          </div>
        )}
        <span
          style={{
            position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,0.92)", color: tokens.body,
            fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px",
          }}
        >
          {subject.category}
        </span>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, color: "#171717" }}>{subject.name}</span>
        {subject.ratingCount > 0 && (
          <span style={{ fontSize: 13, color: "var(--status-warning-fg)" }}>
            {"★".repeat(Math.round(subject.ratingAverage))}
            {"☆".repeat(5 - Math.round(subject.ratingAverage))}
            <span style={{ color: "var(--muted)", marginLeft: 6 }}>({subject.ratingCount})</span>
          </span>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
          <span style={{ fontFamily: "monospace", color: "#171717", fontWeight: 700, fontSize: 15 }}>{money(subject.pricing?.discountedPrice)}</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{subject.totalChapters} chapters</span>
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard;
