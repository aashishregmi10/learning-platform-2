import { Link, useParams, useSearchParams } from "react-router-dom";
import { Chip } from "@mui/material";

import { useGetOrderQuery } from "../../../store/services/orderApi";
import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;
const STATUS_COLOR = { paid: "success", pending: "warning", failed: "error", refunded: "default", cancelled: "default" };

const OrderDetailScreen = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const returnStatus = params.get("status");
  const { data, isLoading } = useGetOrderQuery(id, { pollingInterval: returnStatus === "paid" ? 2000 : 0 });

  const order = data?.data;

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Orders", path: "/app/student/orders" }, { title: order?.invoiceNumber || "Receipt" }]}
      isBusy={isLoading}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {!isLoading && !order && <div>Order not found.</div>}
        {order && (
          <>
            {returnStatus === "paid" && order.status === "paid" && (
              <div style={{ background: "var(--success-accent)", border: "1px solid var(--success)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#2e7d32", fontWeight: 600 }}>
                ✓ Payment successful — your access is unlocked.
              </div>
            )}
            {returnStatus === "failed" && (
              <div style={{ background: "#fdecea", border: "1px solid #e57373", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#b3261e", fontWeight: 600 }}>
                Payment was not completed. You can try again from the catalog.
              </div>
            )}

            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(120deg, var(--student-ink) 0%, var(--student-ink-2) 100%)", color: "#fff", padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", opacity: 0.8 }}>Order Receipt</span>
                  <Chip size="small" label={order.status} color={STATUS_COLOR[order.status] || "default"} />
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 13, opacity: 0.85, marginTop: 4 }}>{order.invoiceNumber || order._id}</div>
              </div>

              <div style={{ padding: "20px 24px" }}>
                {order.items.map((i, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}>
                    <span>{i.title}</span>
                    <span style={{ fontFamily: "monospace" }}>{money(i.discountedPrice)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px dashed var(--border)", margin: "10px 0" }} />
                {order.couponDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)", fontSize: 14 }}>
                    <span>Coupon</span><span style={{ fontFamily: "monospace" }}>− {money(order.couponDiscount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, marginTop: 6, paddingTop: 10, borderTop: "2px solid var(--student-ink-2)" }}>
                  <span>Total</span><span style={{ fontFamily: "monospace" }}>{money(order.totalAmount)}</span>
                </div>

                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                  <Link to="/app/student" style={{ textDecoration: "none", flex: 1, textAlign: "center", background: "var(--student-ink)", color: "#fff", fontWeight: 700, borderRadius: 8, padding: "10px 0" }}>
                    Go to catalog
                  </Link>
                  <Link to="/app/student/subscriptions" style={{ textDecoration: "none", flex: 1, textAlign: "center", background: "#fff", color: "var(--student-ink)", fontWeight: 700, border: "1px solid var(--student-ink)", borderRadius: 8, padding: "10px 0" }}>
                    My subscriptions
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </BreadcrumbLayout>
  );
};

export default OrderDetailScreen;
