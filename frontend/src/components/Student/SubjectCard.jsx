import { MenuBookOutlined, StarRounded } from "@mui/icons-material";

import InfoCard from "./InfoCard";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const SubjectCard = ({ subject }) => {
  const pills = [{ label: subject.category, tone: "solid" }];
  if (subject.entitled) pills.push({ label: "Enrolled", tone: "outline" });

  return (
    <InfoCard
      to={`/app/student/subjects/${subject._id}`}
      pills={pills}
      icon={<MenuBookOutlined sx={{ fontSize: 30, color: "#c3c9d1" }} />}
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
