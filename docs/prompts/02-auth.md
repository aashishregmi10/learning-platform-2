# 02 — Part 1: Authentication & Authorization

> Prepend `00-standards.md` before running this prompt.

## Mission

Implement the three-role identity system (admin / teacher / student) and lock down
the route trees. Students sign in with Google; admin and teachers sign in with
email + password that an **admin creates** (no staff self-signup). Replace
Part 0's `protect` stub with the real middleware.

## Dependencies

Part 0 (skeleton, `baseApi`, `SidebarLayout`). `Subject` does not exist yet, so
`TeacherProfile.assignedSubjects` is an empty ref array until Part 2.

## Models

### `User` (`backend/models/User.js`)
```
googleId:      String, sparse        // students only
email:         String, required, lowercase, trim
passwordHash:  String, select:false  // staff only
authProvider:  String, enum ['google','password'], required
name:          String, required
avatar:        String
role:          String, enum ['admin','teacher','student'], required, default 'student'
isActive:      Boolean, default true
isVerified:    Boolean, default false
forceLogin:    Boolean, default false   // set true after admin changes that must re-auth the user
isDeleted:     Boolean, default false
deletedAt:     Date
lastLoginAt:   Date
timestamps: true
```
Indexes: partial-unique `{ email }` on `isDeleted:false`; sparse-unique
`{ googleId }`; `{ role }`.

### `TeacherProfile` (`backend/models/TeacherProfile.js`)
```
user:             ObjectId ref User, required, unique
qualification:    String
specialization:   String
bio:              String, maxlength 1000
experience:       Number
assignedSubjects: [ObjectId ref Subject]   // SOURCE OF TRUTH for teacher<->subject
payoutDetails: {
  method: String enum ['bank_transfer','esewa','khalti'],
  accountHolderName: String, accountNumber: String, bankName: String, branchOrIfsc: String
}
isApproved:  Boolean, default false
approvedBy:  ObjectId ref User
approvedAt:  Date
timestamps: true
```
Index `{ assignedSubjects: 1 }`.

### `StudentProfile` (`backend/models/StudentProfile.js`)
```
user:        ObjectId ref User, required, unique
program:     ObjectId ref Program            // drives catalog visibility (Part 2)
currentYear: String, enum ['1st Year','2nd Year','3rd Year','4th Year'], default '1st Year'
university:  String, default 'Tribhuvan University'
maxConcurrentDevices: Number, default 2
notificationPreferences: { email:Boolean(true), push:Boolean(true), sms:Boolean(false) }
totalWatchTime:           Number, default 0   // cold counter (rollup)
completedChaptersCount:   Number, default 0
timestamps: true
```
No `stream`. No embedded push tokens (see `Device`).

### `Device` (`backend/models/Device.js`)
```
user:       ObjectId ref User, required
token:      String, required          // FCM/web-push token
deviceType: String, enum ['web','android','ios']
lastUsedAt: Date, default now
timestamps: true
```
Unique `{ user, token }`.

## Backend — middleware

`backend/middlewares/authMiddleware.js`:
- `protect`: read `Authorization: Bearer <token>`; `jwt.verify(token, JWT_SECRET)`;
  `req.user = await User.findById(decoded.id).select("-password")`; if
  `user.forceLogin` → 401 "Please login again."; else `next()`. 401 on missing/bad token.
- `adminOnly`, `teacherOnly`, `studentOnly`: assume `protect` ran; check
  `req.user.role`; 403 otherwise.
- Helper `signToken(user)` → JWT `{ id, role }`, sensible expiry.

## API contract

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/auth/google` | public | Student login via Google ID token |
| POST | `/api/auth/login` | public | Staff (admin/teacher) email+password login |
| GET | `/api/auth/me` | any auth | Current user + profile |
| PUT | `/api/users/me` | any auth | Update own name/avatar/prefs |
| PUT | `/api/users/me/password` | staff | Change own password |
| POST | `/api/devices` | any auth | Register/refresh push token |
| POST | `/api/users/teachers` | admin | Create a teacher (sets credentials) |
| GET | `/api/users/teachers` | admin | Paginated teacher list |
| GET | `/api/users` | admin | Paginated user list (filter by role) |
| PATCH | `/api/users/:id/deactivate` | admin | Soft-deactivate a user |
| PATCH | `/api/users/teachers/:id/approve` | admin | Approve a teacher |

### Examples

**POST `/api/auth/google`** — body `{ "idToken": "<google id token>" }`
- Verify with `google-auth-library` against `GOOGLE_CLIENT_ID`.
- Upsert `User`(`authProvider:'google'`, `role:'student'`) + `StudentProfile`.
- If a matched user has role ≠ student → 403 `{ "message": "Use staff login." }`.
→ 200
```json
{ "data": { "user": { "_id":"...", "name":"Aashish", "email":"a@x.com",
  "role":"student", "avatar":"...", "token":"<jwt>" } }, "message": "Logged in" }
```

**POST `/api/auth/login`** — body `{ "email":"teacher@x.com", "password":"..." }`
- Find user (`+passwordHash`); reject if `role==='student'` or `authProvider!=='password'`.
- `bcrypt.compare`; on success set `lastLoginAt`, return token.
→ 200 same `user` shape; 401 `{ "message":"Invalid credentials" }` on failure.

**POST `/api/users/teachers`** (admin) — body
```json
{ "name":"Dr. Sita", "email":"sita@x.com", "password":"Temp@123",
  "qualification":"PhD Physics", "specialization":"Quantum",
  "assignedSubjects":[] }
```
- Create `User`(`role:'teacher'`, `authProvider:'password'`, hashed password,
  `isVerified:false`) + `TeacherProfile`.
→ 201
```json
{ "data": { "user": { "_id":"...", "email":"sita@x.com", "role":"teacher" },
  "teacherProfile": { "_id":"...", "assignedSubjects":[] } },
  "message": "Teacher created" }
```

**GET `/api/auth/me`** → 200
```json
{ "data": { "user": {...}, "profile": { /* TeacherProfile or StudentProfile */ } },
  "message": "OK" }
```

**Validation failure example** → 422
```json
{ "message": "Validation failed", "errors": { "email": "already in use" } }
```

## Frontend deliverables

```
frontend/src/
├── store/authSlice.js                 # hydrate userInfo, setUser/removeUser, selectLoggedInUser
├── store/services/authApi.js          # useGoogleLoginMutation, useLoginMutation, useGetMeQuery
├── store/services/userApi.js          # teacher CRUD, user list (injectEndpoints)
├── hooks/useAuth.js                   # { loggedInUser, isAdmin, isTeacher, isStudent }
├── routers/
│   ├── middlewares/AuthenticatedOnly.jsx
│   ├── middlewares/AdminOnly.jsx
│   ├── middlewares/TeacherOnly.jsx
│   ├── middlewares/StudentOnly.jsx
│   └── AppRouter.jsx                  # role switch -> sidebar + sub-router
├── components/Sidebar/
│   ├── AdminSidebar.jsx
│   ├── TeacherSidebar.jsx
│   └── StudentSidebar.jsx
└── screens/
    ├── Guest/StudentLoginScreen.jsx   # Google button
    ├── Guest/StaffLoginScreen.jsx     # email+password
    └── App/Admin/Teachers/{List,Create}Screen.jsx
```

- `App.jsx`: `/* ` guest routes; `/app/*` behind `AuthenticatedOnly`.
- `AppRouter` reads `useAuth()` and renders the matching sidebar + role router
  (`AdminRouter` / `TeacherRouter` / `StudentRouter` — minimal stubs for now).
- Admin "Create Teacher" screen uses `react-hook-form` + the standard
  `BreadcrumbLayout` + CRUD pattern.

## Security / correctness

- `passwordHash` never leaves the server; `.select('-password')` everywhere.
- Students ↔ Google only; staff ↔ password only — enforce both directions.
- `forceLogin` invalidates sessions after sensitive admin changes.
- Rate-limit `/api/auth/login` (note it; implementation optional this part).

## Acceptance criteria

- [ ] Student completes Google login → receives JWT → `/api/auth/me` returns student + profile.
- [ ] Admin creates a teacher; that teacher logs in with the set password.
- [ ] Teacher login is rejected on the Google endpoint; student login rejected on staff endpoint.
- [ ] `protect` blocks unauthenticated calls; role guards block cross-role calls (student → `/api/users` = 403).
- [ ] Deactivated / `forceLogin` users are forced to re-authenticate.
- [ ] Frontend: correct sidebar + routes render per role; logout clears `userInfo`.
