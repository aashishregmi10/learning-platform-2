import { StarRounded } from "@mui/icons-material";

import InfoCard from "./InfoCard";
import { tokens } from "../../theme";
import { getSubjectImage, getSubjectIcon } from "../../utils/subjectVisuals";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const SubjectCard = ({ subject }) => {
  // Category (Core/Elective/…) is a label, not a verdict — it stays grey.
  // "Enrolled" is a real positive state, so it earns the success role.
  const pills = [{ label: subject.category }];
  if (subject.entitled) pills.push({ label: "Enrolled", role: "success" });

  const uploadedImage = subject.thumbnail;
  const image = uploadedImage || getSubjectImage(subject.name);
  const Icon = getSubjectIcon(subject.name);

  return (
    <InfoCard
      to={`/app/student/subjects/${subject._id}`}
      pills={pills}
      icon={
        image ? (
          uploadedImage ? (
            <img src={image} alt={subject.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
          ) : (
            <div
              style={{
                width: "100%", height: "100%", borderRadius: 10,
                background: `linear-gradient(135deg, ${tokens.body}, ${tokens.ink})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <img src={image} alt={subject.name} style={{ width: "70%", height: "80%", objectFit: "contain" }} />
            </div>
          )
        ) : (
          <Icon sx={{ fontSize: 30, color: tokens.faint }} />
        )
      }
      title={subject.name}
      meta={
        subject.ratingCount > 0 ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <StarRounded sx={{ fontSize: 16, color: "var(--status-warning-solid)" }} />
            <strong>{subject.ratingAverage?.toFixed(1)}</strong>
            <span style={{ color: "var(--muted)" }}>({subject.ratingCount} reviews)</span>
          </span>
        ) : (
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{subject.totalChapters} chapters</span>
        )
      }
      footerLeft={`${subject.totalChapters} ch.`}
      footerRight={subject.entitled ? "Continue learning →" : money(subject.pricing?.discountedPrice)}
    />
  );
};

export default SubjectCard;
