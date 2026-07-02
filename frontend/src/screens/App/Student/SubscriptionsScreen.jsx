import { Skeleton } from "@mui/material";
import { MenuBookOutlined, CalendarMonthOutlined, SchoolOutlined, CardMembershipOutlined } from "@mui/icons-material";

import { useGetMySubscriptionsQuery } from "../../../store/services/orderApi";
import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import PageHeader from "../../../components/Student/PageHeader";
import EmptyState from "../../../components/Student/EmptyState";
import InfoCard from "../../../components/Student/InfoCard";

const fmt = (d) => new Date(d).toLocaleDateString();
const STATUS_COLOR = { active: "#2e7d32", pending: "#ed6c02", expired: "#6b7280", cancelled: "#6b7280", refunded: "#d32f2f" };
const TYPE_ICON = { subject: <MenuBookOutlined sx={{ fontSize: 30, color: "#c3c9d1" }} />, year: <CalendarMonthOutlined sx={{ fontSize: 30, color: "#c3c9d1" }} />, program: <SchoolOutlined sx={{ fontSize: 30, color: "#c3c9d1" }} /> };

const label = (s) =>
  s.type === "subject" ? s.subject?.name : s.type === "year" ? s.year?.yearName : s.program?.name;

const SubscriptionsScreen = () => {
  const { data, isLoading } = useGetMySubscriptionsQuery();
  const subs = data?.data || [];

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "My Subscriptions" }]} isBusy={isLoading}>
      <div style={{ width: "100%" }}>
        <PageHeader eyebrow="Your Access" title="My Subscriptions" subtitle="Everything you've unlocked, in one place." />

        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))", gap: 18 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: "16px" }} />
            ))}
          </div>
        )}
        {!isLoading && subs.length === 0 && (
          <EmptyState icon={<CardMembershipOutlined fontSize="inherit" />} title="No subscriptions yet" subtitle="Enroll in a subject or year bundle to see it here." />
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))", gap: 18 }}>
          {subs.map((s) => (
            <InfoCard
              key={s._id}
              pills={[
                { label: s.type, tone: "solid" },
                { label: s.status, tone: "outline", color: STATUS_COLOR[s.status] || "#6b7280" },
              ]}
              icon={TYPE_ICON[s.type]}
              title={label(s)}
              meta={<span style={{ fontSize: 13, color: "var(--muted)" }}>Expires {fmt(s.expiresAt)}</span>}
              footerLeft={s.type}
              footerRight={s.status === "active" ? "Active" : s.status}
            />
          ))}
        </div>
      </div>
    </BreadcrumbLayout>
  );
};

export default SubscriptionsScreen;
