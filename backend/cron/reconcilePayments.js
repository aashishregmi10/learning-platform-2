import Order from "../models/Order.js";
import { fulfillOrder } from "../services/fulfillmentService.js";

/**
 * Safety net for the "paid student never blocked" promise: finds paid orders
 * that were never fully fulfilled (e.g. a crash between marking paid and
 * writing entitlements) and re-runs fulfillment. Idempotent.
 */
export const reconcilePayments = async () => {
  const stuck = await Order.find({ status: "paid", fulfilledAt: { $exists: false } }).select("_id");
  let fixed = 0;
  for (const o of stuck) {
    try {
      const r = await fulfillOrder(o._id);
      if (r.fulfilled) fixed++;
    } catch (err) {
      console.error(`reconcile: order ${o._id} failed:`, err.message);
    }
  }
  if (fixed) console.log(`♻️  reconcilePayments: fulfilled ${fixed} stuck order(s)`);
  return fixed;
};

/** Schedule the reconciliation loop (every 5 minutes). */
export const scheduleReconciliation = () => {
  setInterval(() => {
    reconcilePayments().catch((e) => console.error("reconcile error:", e.message));
  }, 5 * 60 * 1000);
};
