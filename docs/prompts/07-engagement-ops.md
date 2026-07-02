# 07 — Part 6: Engagement & Ops

> Prepend `00-standards.md` before running this prompt.

## Mission

Add the engagement and operations layer: verified-purchase **reviews**, chapter /
live-class **doubts (Q&A)**, an admin/teacher **activity audit log**, optional
**teacher payouts**, and the **admin monitoring dashboards** that satisfy the
requirement "admin monitors every user, course, subject, live class, PDF and note."

## Dependencies

Parts 1–5. Reviews/doubts gate on Part 3 Entitlement; activity logging wraps
mutations from Parts 2–5.

## Models

### `Review` (`models/Review.js`)
```
student:ref User req
targetType:enum['subject','teacher'] req
subject:ref Subject | teacher:ref User
rating:Number req min 1 max 5 | comment:String maxlength 1000 | isVisible:Boolean default true
response:{ text:String maxlength 1000, respondedAt:Date, respondedBy:ref User }
```
Indexes `{ subject, isVisible }`, `{ teacher, isVisible }`; partial-unique
`{ student, subject }` where `targetType:'subject'` and `{ student, teacher }` where
`targetType:'teacher'`.

### `Doubt` (`models/Doubt.js`)
```
author:ref User req | authorRole:enum['student','teacher'] req
chapter:ref Chapter | liveClass:ref LiveClass | subject:ref Subject   // denormalized subject
parentDoubt:ref Doubt        // null=top-level; set=one-level reply
content:String req maxlength 2000
isResolved:Boolean default false | resolvedBy:ref User
upvoteCount:Number default 0 | isDeleted:Boolean default false
```
Indexes `{ chapter, createdAt:-1 }`, `{ liveClass, createdAt:-1 }`, `{ subject, createdAt:-1 }`, `{ parentDoubt }`.

### `ActivityLog` (`models/ActivityLog.js`)
```
actor:ref User req | actorRole:enum['admin','teacher'] req
action:enum[ /* admin */ 'create_teacher','approve_teacher','deactivate_user','update_pricing',
  'create_subject','update_subject','delete_content','view_report','refund_order',
  'create_coupon','update_coupon','issue_certificate','process_payout','hide_review',
  /* teacher */ 'upload_content','update_content','create_live_class','update_live_class',
  'cancel_live_class','resolve_doubt' ] req
description:String | targetType:String | targetId:ObjectId
changes:{ before:Mixed, after:Mixed } | ipAddress:String | userAgent:String
```
Indexes `{ actor, createdAt:-1 }`, `{ targetType, targetId }`.

### `TeacherPayout` (`models/TeacherPayout.js`) — only if revenue-share is used
```
teacher:ref User req | periodStart:Date req | periodEnd:Date req
attributedSubscriptions:Number default 0 | attributedRevenue:Number default 0
revenueSharePercent:Number | payoutAmount:Number req | currency:'NPR'
status:enum['pending','processing','paid','failed'] default 'pending'
paidAt:Date | processedBy:ref User | notes:String
```
Index `{ teacher, periodStart, periodEnd }`.

## API contract

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/reviews` | S(entitled) | Create a verified-purchase review |
| GET | `/api/reviews/subject/:id` | P·S | Visible reviews + summary |
| GET | `/api/reviews/teacher/:id` | P·S | Visible teacher reviews |
| PATCH | `/api/reviews/:id/respond` | T·A | Teacher/admin response |
| PATCH | `/api/reviews/:id/visibility` | A | Hide/show without deleting |
| POST | `/api/doubts` | S·T(gated) | Ask / reply (one level) |
| GET | `/api/doubts/chapter/:id` , `/live-class/:id` | S·T(gated) | Threaded list |
| PATCH | `/api/doubts/:id/resolve` | T·A | Mark resolved |
| POST | `/api/doubts/:id/upvote` | any | Increment upvote |
| GET | `/api/activity-logs` | A | Paginated audit (`?actor=&action=&targetType=`) |
| GET | `/api/admin/dashboard` | A | Aggregate monitoring metrics |
| GET | `/api/admin/monitor/:resource` | A | Drill-down: users·subjects·live·content |
| CRUD | `/api/payouts*` | A | Teacher payout management |

### Examples

**POST `/api/reviews`** (student) — gated on a past/present Entitlement for the subject:
```json
{ "targetType":"subject", "subject":"<id>", "rating":5, "comment":"Crystal clear." }
```
- Reject if no Entitlement ever existed → 403 `{ "message":"Only enrolled students can review." }`
- On success, recompute `Subject.ratingAverage`/`ratingCount` (service function).
→ 201 `{ "data":{ "_id":"...", "rating":5 }, "message":"Review posted" }`

**GET `/api/reviews/subject/:id`** → 200
```json
{ "data": { "summary":{ "average":4.6, "count":58,
  "distribution":{ "5":40,"4":12,"3":4,"2":1,"1":1 } },
  "reviews":[ { "student":{"name":"..."}, "rating":5, "comment":"...",
  "response":{ "text":"Thanks!" } } ] }, "totalItems":58, "message":"OK" }
```

**POST `/api/doubts`** — gated like content access:
```json
{ "chapter":"<id>", "content":"Why is angular momentum conserved here?" }
```
- Server denormalizes `subject` from the chapter; `parentDoubt` optional (reject
  replies-to-replies — enforce one level). → 201.

**GET `/api/admin/dashboard`** → 200 (satisfies the monitoring requirement)
```json
{ "data": { "users":{ "students":1240, "teachers":18, "active7d":860 },
  "catalog":{ "programs":4, "subjects":52, "publishedContents":1380 },
  "commerce":{ "revenueNPR":1840000, "ordersPaid":960, "activeSubscriptions":1110 },
  "live":{ "upcoming":7, "last30dAttendanceAvg":63 } }, "message":"OK" }
```

## Backend rules

- **Review gating:** allow review only if an Entitlement for the subject exists or
  existed (past purchase counts). Keep `Subject.ratingAverage/ratingCount` updated
  in a service function on create/visibility-change/delete.
- **Activity logging middleware:** a reusable helper `logActivity(actor, action,
  { targetType, targetId, before, after, req })` invoked from every admin/teacher
  mutation across Parts 2–5 (wire it in as you build, or retrofit here). Capture
  `before`/`after` for updates.
- **Doubt threading:** enforce one level (`parentDoubt` of a reply must itself be
  top-level). Denormalize `subject` for fast subject-wide queries.
- **Payouts:** compute attributed revenue per teacher per period from paid
  Subscriptions on their assigned subjects (only if revenue-share is enabled;
  otherwise the collection stays empty).

## Frontend deliverables

Student (storefront design):
```
components/Student/{ReviewForm,ReviewList,RatingSummary,DoubtThread,DoubtComposer}.jsx
```
Admin/Teacher (dashboard design):
```
screens/App/Admin/Dashboard/AdminDashboardScreen.jsx        // metric cards + charts (recharts)
screens/App/Admin/Monitor/{Users,Subjects,LiveClasses,Content}MonitorScreen.jsx
screens/App/Admin/ActivityLog/ActivityLogScreen.jsx
screens/App/Admin/Payout/{List,Detail}Screen.jsx
teacher: review-response + doubt-resolve surfaces on Subject/LiveClass detail tabs
```

## Acceptance criteria

- [ ] Only students with a past/present Entitlement can review; ratings roll up correctly.
- [ ] Doubts thread exactly one level deep; resolve + upvote work; subject denormalized.
- [ ] Every admin/teacher mutation writes an ActivityLog with before/after where relevant.
- [ ] Admin dashboard + drill-down monitors users, subjects, live classes, PDFs and notes.
- [ ] (If enabled) payouts compute attributed revenue per teacher per period.
```

---

## You're done

All seven parts (plus standards) are specified. Suggested build order:
**Part 0 → 1 → 2 → 3 → 4 → 5 → 6.** Each part's "Acceptance criteria" is the
gate before moving on. Re-read `00-standards.md` at the start of every part.
