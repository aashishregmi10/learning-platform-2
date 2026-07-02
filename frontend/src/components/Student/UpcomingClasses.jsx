import { useGetUpcomingLiveClassesQuery } from "../../store/services/liveClassApi";
import LiveJoinButton from "./LiveJoinButton";

const fmt = (d) =>
  new Date(d).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const UpcomingClasses = () => {
  const { data, isLoading } = useGetUpcomingLiveClassesQuery();
  const classes = data?.data ?? [];

  if (isLoading) return <div style={{ color: "#8C7B6B" }}>Loading…</div>;
  if (classes.length === 0) {
    return <p style={{ color: "#8C7B6B" }}>Nothing scheduled yet — check back soon.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {classes.map((c) => (
        <div
          key={c._id}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #E7E0D4", borderRadius: 10, padding: "12px 16px" }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{c.title}</div>
            <div style={{ color: "#8C7B6B", fontSize: 13 }}>
              {c.subject?.name} · {c.teacher?.name} · {fmt(c.scheduledAt)}
              {c.status === "live" && <span style={{ color: "#2D5A3D", fontWeight: 600 }}> · Live now</span>}
            </div>
          </div>
          <LiveJoinButton liveClass={c} />
        </div>
      ))}
    </div>
  );
};

export default UpcomingClasses;
