# 04 — Part 3: Commerce & Payments (eSewa)

> Prepend `00-standards.md` before running this prompt.

## Mission

Implement purchasing a single subject, a full year, or a whole program via
**eSewa**, such that a paid student gets **immediate, durable, idempotent** access.
The flow is `Order → (eSewa verify) → Subscription(s) → Entitlement(s)`. Access is
ALWAYS resolved through `Entitlement`, never by scanning Subscriptions.

## Dependencies

Part 1 (User), Part 2 (Program/BScYear/Subject). After this part, Part 2's
`catalog/me` `entitled` flag and Part 4/5 gating become real.

## Models

### `Order` (`models/Order.js`)
```
user:ObjectId ref User required
items:[{ itemType:enum['subject','year','program'] req,
         subject:ObjectId ref Subject, year:ObjectId ref BScYear, program:ObjectId ref Program,
         originalPrice:Number req, discountedPrice:Number req }]
coupon:ObjectId ref Coupon
subtotal:Number req | couponDiscount:Number default 0 | taxAmount:Number default 0
totalAmount:Number req | currency:'NPR'
status:enum['pending','paid','failed','cancelled','refunded'] default 'pending'
payment:{ gateway:enum['esewa',...], transactionRef:String, paymentId:String, paidAt:Date }
paymentEvent:ObjectId ref PaymentEvent
invoiceNumber:String (sparse-unique) | invoiceUrl:String
```
Indexes `{ user, status, createdAt:-1 }`, `{ 'payment.transactionRef' }`.

### `Coupon` (`models/Coupon.js`)
```
code:String req unique uppercase trim | description:String
discountType:enum['percentage','flat'] req | discountValue:Number req
appliesTo:enum['subject','year','program','all'] default 'all'
applicableSubjects:[ref Subject] | applicableYears:[ref BScYear] | applicablePrograms:[ref Program]
minOrderAmount:Number default 0 | maxRedemptions:Number | redemptionCount:Number default 0
perUserLimit:Number default 1 | validFrom:Date | validUntil:Date | isActive:Boolean default true
createdBy:ref User
```
Indexes `{ code }`, `{ isActive, validUntil }`.

### `CouponRedemption` (`models/CouponRedemption.js`)
```
coupon:ref Coupon req | user:ref User req | order:ref Order req | discountApplied:Number req
```
Index `{ coupon, user }`.

### `Subscription` (`models/Subscription.js`)
```
user:ref User req | order:ref Order | renewedFrom:ref Subscription | coupon:ref Coupon
type:enum['subject','year','program'] req
subject:ref Subject | year:ref BScYear | program:ref Program
price:{ amount:Number req, currency:'NPR', originalAmount:Number, discountApplied:Number default 0 }
startedAt:Date default now | expiresAt:Date req
status:enum['active','expired','cancelled','pending','refunded'] default 'pending'
payment:{ gateway, transactionRef, paymentId, paidAt }   // denormalized snapshot
refund:{ isRefunded:Boolean default false, amount, reason, refundedAt, refundedBy:ref User }
invoiceUrl:String
```
Indexes `{ user, status, expiresAt }`, `{ user, type, subject }`, `{ order }`.

### `Entitlement` (`models/Entitlement.js`) — the access table
```
student:ref User req | subject:ref Subject req
source:enum['subject','year','program'] req | subscription:ref Subscription req
expiresAt:Date req | isActive:Boolean default true
```
Index `{ student, subject, isActive, expiresAt }`. Keep **at most one active row per
student+subject**: on renewal, extend `expiresAt` instead of inserting a duplicate.

### `PaymentEvent` (`models/PaymentEvent.js`) — idempotency + audit
```
eventId:String req UNIQUE        // the idempotency guard
gateway:enum['esewa',...] req | eventType:String req
order:ref Order | subscription:ref Subscription | rawPayload:Mixed
status:enum['received','verifying','processed','failed'] default 'received'
verifiedAt:Date | verificationMethod:enum['server_lookup','manual']
processedAt:Date | errorMessage:String
```

## API contract

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/coupons/validate` | S | Validate a code against a draft cart |
| POST | `/api/orders` | S | Create a pending order from cart |
| GET | `/api/orders/mine` | S | Paginated order history |
| GET | `/api/orders/:id` | S(owner)·A | Order detail + invoice |
| POST | `/api/payments/esewa/initiate` | S | Get eSewa form params for an order |
| GET/POST | `/api/payments/esewa/callback` | public | Return URL → **server verify** → fulfill |
| GET | `/api/subscriptions/mine` | S | Active/expired subscriptions |
| GET | `/api/entitlements/mine` | S | Resolved access list |
| POST | `/api/orders/:id/refund` | A | Refund → revoke entitlements |
| CRUD | `/api/coupons*` | A | Coupon management |

### Examples

**POST `/api/orders`**
```json
{ "items":[ { "itemType":"subject", "subject":"<id>" },
            { "itemType":"year", "year":"<id>" } ],
  "couponCode":"LAUNCH20" }
```
- Server re-prices from live Subject/Year (never trusts client prices), snapshots
  `originalPrice`/`discountedPrice` per item, validates+applies coupon scope/limits,
  computes `subtotal/couponDiscount/taxAmount/totalAmount`.
→ 201
```json
{ "data": { "_id":"<orderId>", "totalAmount":3998, "currency":"NPR",
  "status":"pending" }, "message":"Order created" }
```

**POST `/api/payments/esewa/initiate`** — body `{ "orderId":"<id>" }`
→ 200 (params the frontend posts to eSewa; `transaction_uuid = order.payment.transactionRef`)
```json
{ "data": { "esewaUrl":"https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  "fields": { "amount":"3998", "transaction_uuid":"<uuid>",
  "product_code":"<merchant>", "signature":"<hmac>", "signed_field_names":"...",
  "success_url":"...", "failure_url":"..." } }, "message":"OK" }
```

**eSewa callback → fulfillment (the critical path):**
1. Persist `PaymentEvent`(`eventId` from gateway ref, `status:'received'`). If the
   `eventId` already exists → respond 200 and **stop** (idempotent).
2. `status:'verifying'` → call `ESEWA_STATUS_URL` with `transaction_uuid` +
   `total_amount` (server-to-server). Confirm `status === 'COMPLETE'` and amount
   matches the Order. **Never trust the redirect payload alone.**
3. On confirm: set `PaymentEvent.verifiedAt` + `verificationMethod:'server_lookup'`,
   flip `Order.status='paid'`.
4. **Fulfillment (one transaction, idempotent on `Order._id`):**
   - one `Subscription` per order item (`status:'active'`, `expiresAt` from
     `validityDays`);
   - expand `Entitlement` rows: `subject`→1; `year`→all subjects in that
     program-year; `program`→all subjects in that program (all years). Upsert by
     `{student,subject}` extending `expiresAt` if a row exists.
   - mark `PaymentEvent.status='processed'`, `processedAt`.
   Re-running the whole step is a no-op.
→ redirect student to `/app/student/orders/:id?status=paid`.

**POST `/api/orders/:id/refund`** (admin) → flips `Subscription.refund.isRefunded`
and sets matching `Entitlement.isActive=false`. Returns the updated order.

## Backend rules

- **Reconciliation cron** (`backend/cron/reconcilePayments.js`): find Orders
  `status:'paid'` whose expected Entitlement set is incomplete and re-run
  fulfillment. This is the safety net for a crash between steps 3 and 4 — it is what
  guarantees the "paid student never blocked" promise.
- **Coupon atomicity:** validate `perUserLimit` against `CouponRedemption`,
  `maxRedemptions` against `redemptionCount`; increment `redemptionCount` + write
  `CouponRedemption` inside the fulfillment transaction.
- **Price integrity:** all monetary math server-side; reject mismatched amounts at
  verification.
- **Invoices:** generate `invoiceNumber` (`PT-YYYYMMDD-XXXXX`-style) + `invoiceUrl`
  on `paid`.

## Frontend deliverables (student storefront design)

```
store/services/{orderApi,couponApi,subscriptionApi,entitlementApi,paymentApi}.js
screens/App/Student/{Cart,Checkout,OrderReturn,Orders,MySubscriptions}Screen.jsx
components/Student/{CartLineItem,CouponBox,PriceSummary,BuyButton}.jsx
admin: screens/App/Admin/Coupon/{List,Create,Edit}Screen.jsx (dashboard design)
```
- Buy buttons on Subject/Year/Program pages → cart → checkout → `initiate` → POST
  to eSewa → return handler reads order status → "My Subscriptions" reflects access.

## Acceptance criteria

- [ ] eSewa sandbox purchase: callback **verifies server-side** before Order→paid.
- [ ] Exactly one Subscription + correct Entitlement set per purchase; year/program expand correctly.
- [ ] Duplicate callback (same `eventId`) is a 200 no-op (idempotent).
- [ ] Kill the server between verify and fulfillment; reconciliation cron creates the missing Entitlements.
- [ ] Coupon limits (`perUserLimit`, `maxRedemptions`, scope) enforced.
- [ ] Refund flips subscription + sets `Entitlement.isActive=false`; student loses access.
- [ ] `entitled` flag in `/api/catalog/me` now reflects real entitlements.
