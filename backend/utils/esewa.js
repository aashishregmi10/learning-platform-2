import crypto from "crypto";

import { env } from "../config/env.config.js";

/**
 * eSewa ePay v2 signature: HMAC-SHA256 (base64) over
 *   "total_amount={t},transaction_uuid={u},product_code={c}"
 * using the merchant secret key.
 */
export const signEsewa = ({ totalAmount, transactionUuid, productCode }) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto
    .createHmac("sha256", env.esewa.secretKey)
    .update(message)
    .digest("base64");
};

/** Build the exact fields the browser posts to eSewa's form endpoint. */
export const buildEsewaFormFields = ({ order, successUrl, failureUrl }) => {
  const totalAmount = String(order.totalAmount);
  const transactionUuid = order.payment.transactionRef;
  const productCode = env.esewa.merchantCode;

  const signature = signEsewa({ totalAmount, transactionUuid, productCode });

  return {
    amount: String(order.subtotal - order.couponDiscount),
    tax_amount: String(order.taxAmount || 0),
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };
};

/**
 * Server-to-server status lookup. Returns eSewa's status object
 * ({ status: 'COMPLETE' | 'PENDING' | 'NOT_FOUND' | ..., total_amount, ref_id }).
 * NEVER trust the redirect payload alone — this is the source of truth.
 */
export const lookupEsewaStatus = async ({ totalAmount, transactionUuid }) => {
  const url = `${env.esewa.statusUrl}?product_code=${env.esewa.merchantCode}&total_amount=${totalAmount}&transaction_uuid=${encodeURIComponent(
    transactionUuid
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`eSewa status lookup failed (${res.status})`);
  return res.json();
};

/** Decode the base64 `data` param eSewa appends to the success_url. */
export const decodeEsewaCallback = (dataB64) => {
  try {
    return JSON.parse(Buffer.from(dataB64, "base64").toString("utf8"));
  } catch {
    return null;
  }
};
