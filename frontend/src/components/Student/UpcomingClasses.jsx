import { Skeleton } from "@mui/material";
import { VideocamOutlined } from "@mui/icons-material";

import { tokens } from "../../theme";
import { useGetUpcomingLiveClassesQuery } from "../../store/services/liveClassApi";
import LiveJoinButton from "./LiveJoinButton";
import InfoCard from "./InfoCard";
import EmptyState from "./EmptyState";

const fmt = (d) =>
  new Date(d).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const UpcomingClasses = () => {
  const { data, isLoading } = useGetUpcomingLiveClassesQuery();
  const classes = data?.data ?? [];

  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))", gap: 18 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: "16px" }} />
        ))}
      </div>
    );
  }
  if (classes.length === 0) {
    return <EmptyState icon={<VideocamOutlined fontSize="inherit" />} title="Nothing scheduled yet" subtitle="Check back soon for upcoming sessions." />;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))", gap: 18 }}>
      {classes.map((c) => (
        <InfoCard
          key={c._id}
          pills={[
            // Subject name is descriptive — grey. Only the live state is coloured,
            // and it's success everywhere now (it used to be red only here).
            { label: c.subject?.name },
            ...(c.status === "live" ? [{ label: "● LIVE", role: "success" }] : []),
          ]}
          icon={<VideocamOutlined sx={{ fontSize: 30, color: tokens.faint }} />}
          title={c.title}
          meta={<span style={{ fontSize: 13, color: "var(--muted)" }}>{c.teacher?.name} · {fmt(c.scheduledAt)}</span>}
          footerLeft={c.subject?.name}
          footerRight={<LiveJoinButton liveClass={c} />}
        />
      ))}
    </div>
  );
};

export default UpcomingClasses;
