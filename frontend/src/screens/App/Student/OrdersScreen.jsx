import { Skeleton } from "@mui/material";
import { ReceiptLongOutlined } from "@mui/icons-material";

import { useGetMyOrdersQuery } from "../../../store/services/orderApi";
import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import PageHeader from "../../../components/Student/PageHeader";
import EmptyState from "../../../components/Student/EmptyState";
import InfoCard from "../../../components/Student/InfoCard";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;
const STATUS_COLOR = { paid: "#2e7d32", pending: "#ed6c02", failed: "#d32f2f", refunded: "#6b7280" };
const fmt = (d) => new Date(d).toLocaleDateString();

const OrdersScreen = () => {
  const { data, isLoading } = useGetMyOrdersQuery({ limit: 50 });
  const orders = data?.data || [];

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Orders" }]} isBusy={isLoading}>
      <div style={{ width: "100%" }}>
        <PageHeader eyebrow="Billing" title="My Orders" subtitle="Every purchase and its receipt." />

        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))", gap: 18 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: "16px" }} />
            ))}
          </div>
        )}
        {!isLoading && orders.length === 0 && (
          <EmptyState icon={<ReceiptLongOutlined fontSize="inherit" />} title="No orders yet" subtitle="Your purchases will show up here as soon as you enroll." />
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 380px))", gap: 18 }}>
          {orders.map((o) => (
            <InfoCard
              key={o._id}
              to={`/app/student/orders/${o._id}`}
              pills={[{ label: o.status, tone: "solid", color: STATUS_COLOR[o.status] || "#6b7280" }]}
              icon={<ReceiptLongOutlined sx={{ fontSize: 30, color: "#c3c9d1" }} />}
              title={o.items.map((i) => i.title).join(", ")}
              meta={<span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{o.invoiceNumber || o._id} · {fmt(o.createdAt)}</span>}
              footerLeft={<span style={{ fontFamily: "monospace" }}>{money(o.totalAmount)}</span>}
              footerRight="View receipt →"
            />
          ))}
        </div>
      </div>
    </BreadcrumbLayout>
  );
};

export default OrdersScreen;
