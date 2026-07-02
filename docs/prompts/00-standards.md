# 00 — Standards Preamble (prepend to EVERY part prompt)

You are a **senior MERN engineer** building **"B.Sc Nepal"**, a learning platform
specific to B.Sc students (Tribhuvan University, Nepal), in the
`learning-platform-2` monorepo. These standards are binding for every part. When a
part prompt and this file ever conflict, **this file wins** unless the part prompt
says "overrides standards".

---

## 1. Product in one paragraph

A B.Sc-only e-learning platform. **Admin** creates teachers and monitors every
user, course, subject, live class, PDF and note. **Teachers** author content on
their assigned subjects and run live classes. **Students** sign in with Google,
browse the catalog for their program, buy a single subject / a full year / a whole
program, then consume notes, chapters, PDFs and recorded videos, and attend
paid-only live classes. **Non-negotiable promise:** a student with an active
entitlement must never be blocked from content or classes they paid for.

## 2. Architecture

- **Monorepo**, mirroring the `can-logistic` reference project:
  - `backend/` — Express 4/5 + Mongoose, **ESM** (`"type":"module"`).
  - `frontend/` — Vite + React 19 + React Router v6 + Redux Toolkit + RTK Query.
  - Root `package.json` runs both with `concurrently`.
- **Frontend talks to Express only.** The frontend never touches MongoDB. Express
  owns Mongoose.
- **Auth = simplified role-based.** Keep can-logistic's *patterns* (`protect`,
  role guards, `useAuth`) but **no multi-tenancy** — there is no
  account/entity/viewEntity/authorization-level layer. The JWT carries `id` + `role`.
- **Hierarchy:** `Program → BScYear → Subject → Chapter → Content`.
- **Market:** Nepal. **Currency is always NPR.** Payment gateway is **eSewa**
  (the `gateway` enum leaves room for `khalti | fonepay | connectips` later, but
  only eSewa is implemented now). No INR, Razorpay, or Stripe anywhere.

## 3. Design system (split — important)

- **Admin + Teacher panels → reuse can-logistic's dashboard design.** MUI
  `SidebarLayout` (top `AppBar` + persistent left `Drawer`) + `BreadcrumbLayout`
  compound component + `CustomTabs`/`CustomTabPanel` + `AppTable` data tables +
  the **CRUD quartet** (List / Create / Edit / Detail) per entity.
- **Student storefront → its own consumer/edtech design** (course cards, hero,
  clean Subject/course pages, video player, cart/checkout — Udemy / Physics Wallah
  style). Do **not** force the admin table aesthetic onto student screens.

## 4. Backend conventions (from can-logistic)

- **One concern per file.** Models in `backend/models/` (one model per file,
  `export default`). Controllers in `backend/controllers/`. Routes in
  `backend/routes/`. Config in `backend/config/`. Middleware in
  `backend/middlewares/`. Cron in `backend/cron/`. Services/helpers in
  `backend/utils/` or `backend/services/`.
- **Controllers** wrapped in `express-async-handler`.
- **Routes are thin:** `router.route("/path").get(protect, roleGuard, controller)`.
- **`server.js` boot order:** load env → `await connectDB()` → create app →
  `express.json({limit:"10mb"})` → CORS from async config → mount `/api/*` routes
  → static (prod) → `ERROR_HANDLER` → `NOT_FOUND_HANDLER` → `server.listen` →
  `process.on("unhandledRejection")` + `process.on("uncaughtException")` guards.
- **Never log PII.** Log ids, not emails/phones/names.
- **Secrets only in `.env`** (gitignored). Commit `.env.example`.

## 5. API response contract (binding)

- **Success (single):** `200/201` →
  ```json
  { "data": { /* resource */ }, "message": "Human readable success" }
  ```
- **Success (list, paginated):** `200` →
  ```json
  { "data": [ /* items */ ], "totalItems": 137, "message": "OK" }
  ```
- **Failure:** appropriate `4xx/5xx` →
  ```json
  { "message": "Human readable error", "errors": { "field": "reason" } }
  ```
  `errors` is optional and only present for field-level validation failures.
- The central error middleware translates Mongo errors: duplicate key (`11000`) →
  `"Field(s) already exist. Duplicate <fields>."`; Mongoose `required` validation →
  `"Missing required fields: <fields>"`.

## 6. Pagination (binding — every list endpoint)

- Query contract: `?page=1&limit=10&search=&<filters>`.
- Implement with a Mongo **aggregation** ending in:
  ```js
  { $facet: {
      data:  [ { $sort: { <field>: 1 } }, { $skip: (page-1)*limit }, { $limit: limit } ],
      count: [ { $count: "total" } ],
  }}
  ```
  Respond `{ data: result[0].data, totalItems: result[0].count[0]?.total ?? 0, message: "OK" }`.
- `search` is a case-insensitive `$regex` over the model's primary text field(s).
- Frontend lists run in **server-pagination** mode; tab / search / page / perPage
  state lives in the **URL** (`useSearchParams` + `useTablePagination`).

## 7. Frontend conventions (from can-logistic)

- **Single `baseApi`** (`createApi`, `reducerPath:"baseApi"`, `baseUrl:"/api"`)
  with `prepareHeaders` injecting `Authorization: Bearer <token>` from
  `state.auth.user.token`, and a **central `tagTypes`** array. Per-domain files use
  `baseApi.injectEndpoints({ endpoints })` and export hooks. Use
  `providesTags`/`invalidatesTags` for cache correctness.
- **`authSlice`** hydrates `user` from `localStorage("userInfo")`; exposes
  `setUser` / `removeUser` and selectors `selectLoggedInUser`.
- **`useAuth()`** derives role flags `isAdmin / isTeacher / isStudent` from the user.
- **Routing:** `App` → `AuthenticatedOnly` gate → `AppRouter` reads role via
  `useAuth()` and selects the matching sidebar + role router. Role guards:
  `AuthenticatedOnly`, `AdminOnly`, `TeacherOnly`, `StudentOnly`.
- **Admin/Teacher screens** use `BreadcrumbLayout` + the CRUD quartet; **forms**
  use `react-hook-form` `Controller` + a shared `BaseAutocomplete` for relations;
  **detail screens** publish their record through a React context for nested tabs.

## 8. The one access rule (used by every content/live endpoint)

```js
// hasActiveEntitlement(studentId, subjectId) =
//   Entitlement.exists({ student, subject, isActive:true, expiresAt: { $gt: now } })
canAccess(content, chapter, student) =
  content.isFree === true
  || chapter.isFreePreview === true
  || hasActiveEntitlement(student._id, chapter.subject);
```

Implement this **once** (e.g. `backend/utils/access.js`) and call it everywhere —
content playback URL minting, PDF/note fetch, quiz access, live-class join. Never
re-implement the precedence ad hoc per endpoint.

## 9. Data-modeling rules

- **Soft-delete** (`isDeleted` + `deletedAt`) on long-lived models (User,
  Program, BScYear, Subject, Chapter, Content). Never hard-delete anything that
  Progress / Subscription / Entitlement / QuizAttempt may reference.
- **Partial unique indexes** on every soft-deletable unique field:
  `schema.index({ field: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } })`.
- **NPR-only** `currency` enums (`enum: ['NPR'], default: 'NPR'`).
- **gateway** enum: `['esewa','khalti','fonepay','connectips']`, only `esewa`
  wired now.
- **Cached counters** (e.g. `Subject.totalChapters`, `ratingAverage`) are updated
  in **service functions only**, never written ad hoc; cold counters
  (`totalWatchTime`, `TeacherProfile.totalStudents`) are computed by scheduled
  rollups, not on every write.
- Don't add an index where `unique: true` already creates one.

## 10. Security baseline

- `passwordHash` is `select:false` and never serialized.
- Students authenticate only via Google; staff (admin/teacher) only via
  email+password. Enforce both directions (a student can't get a password; staff
  can't log in via Google).
- Payment is **verified server-side** against the gateway's status API before any
  order is marked paid (see Part 3). Never trust a redirect query string or webhook
  body alone.
- Media is served via **short-TTL signed URLs** minted per request; playable URLs
  are never stored in the DB. Videos carry a **per-viewer watermark** generated at
  playback time.
- Quiz answer keys (`correctOptionIndex`, `explanation`) are **never** sent to a
  student before they submit an attempt (projection concern).

## 11. Definition of done (every part)

- All endpoints follow the response + pagination contract.
- Every protected route declares its `protect` + role guard.
- Models have the specified indexes (incl. partial-unique).
- Input validation + field-level `errors` on bad input.
- A short `README` section (or PR description) listing endpoints and how to test.
- No secrets committed; `.env.example` updated for any new env var.

---

### Environment variables (cumulative across parts)

```
# backend/.env
NODE_ENV=development
PORT=5000
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
ESEWA_MERCHANT_CODE=
ESEWA_SECRET_KEY=
ESEWA_STATUS_URL=
MEDIA_PROVIDER=            # s3 | cloudflare-stream | gumlet | bunny
MEDIA_BUCKET=
MEDIA_SIGNING_KEY=

# frontend/.env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=
```
