import { StarRounded } from "@mui/icons-material";

import InfoCard from "./InfoCard";
import { getSubjectImage, getSubjectIcon } from "../../utils/subjectVisuals";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const CATEGORY_COLOR = {
  Core: "#1976d3",
  Elective: "#2D5A3D",
  Practical: "#b26a00",
  "Ability Enhancement": "#7b1fa2",
};

const SubjectCard = ({ subject }) => {
  const pills = [{ label: subject.category, tone: "solid" }];
  if (subject.entitled) pills.push({ label: "Enrolled", tone: "outline" });

  const uploadedImage = subject.thumbnail;
  const image = uploadedImage || getSubjectImage(subject.name);
  const Icon = getSubjectIcon(subject.name);
  const chipColor = CATEGORY_COLOR[subject.category] || "#1976d3";

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
                background: `linear-gradient(135deg, ${chipColor}, #10365e)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <img src={image} alt={subject.name} style={{ width: "70%", height: "80%", objectFit: "contain" }} />
            </div>
          )
        ) : (
          <Icon sx={{ fontSize: 30, color: "#8b95a5" }} />
        )
      }
      title={subject.name}
      meta={
        subject.ratingCount > 0 ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <StarRounded sx={{ fontSize: 16, color: "var(--student-gold)" }} />
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
