# 06 — Part 5: Live Classes & Notifications

> Prepend `00-standards.md` before running this prompt.

## Mission

Deliver **paid-only live classes**: teachers schedule and run them; entitled
students join (access checked at join time), attendance is recorded, reminders fire
on a schedule, and notifications are delivered across push/email/in-app with
per-channel status. Enforce a concurrent-device cap that never falsely locks out a
paying student.

## Dependencies

Part 1 (User, Device), Part 2 (Subject), Part 3 (Entitlement). Reuses `Device`.

## Models

### `LiveClass` (`models/LiveClass.js`)
```
subject:ref Subject req | teacher:ref User req
title:String req | description:String
scheduledAt:Date req | duration:Number req (min) | timezone:String default 'Asia/Kathmandu'
audience:enum['paid','free'] default 'paid'
meetingLink:String | meetingPassword:String   // app-layer encrypted; prefer per-student join tokens
recording:{ isAvailable:Boolean default false, storage:{ provider:enum[...], fileKey:String },
            durationSeconds:Number, uploadedAt:Date }
attendeeCount:Number default 0                 // cached
status:enum['scheduled','live','ended','cancelled'] default 'scheduled'
notificationsSent:{ reminder24h:Boolean default false, reminder1h:Boolean default false, reminder15m:Boolean default false }
```
Indexes `{ subject, scheduledAt }`, `{ status, scheduledAt }`.

### `Attendance` (`models/Attendance.js`)
```
liveClass:ref LiveClass req | student:ref User req
joinedAt:Date req | leftAt:Date | totalDurationMinutes:Number default 0 | sessionCount:Number default 1
```
Unique `{ liveClass, student }`; index `{ student, createdAt:-1 }`.

### `Notification` (`models/Notification.js`)
```
user:ref User req | title:String req | message:String req
type:enum['live_class','new_content','subscription','system','promotion'] req
actionUrl:String | relatedLiveClass:ref LiveClass | relatedContent:ref Content
channels:{ push:Boolean default false, email:Boolean default false, inApp:Boolean default true }
delivery:{ push:{ delivered:Boolean, deliveredAt:Date, failed:Boolean, failReason:String },
           email:{ delivered:Boolean, deliveredAt:Date, failed:Boolean, failReason:String },
           inApp:{ delivered:Boolean, deliveredAt:Date } }
isRead:Boolean default false | readAt:Date
```
Indexes `{ user, isRead }`, `{ user, createdAt:-1 }`.

### `ActiveSession` (`models/ActiveSession.js`)
```
student:ref User req | deviceId:String req | deviceType:enum['web','android','ios']
ip:String | userAgent:String | lastSeenAt:Date default now
```
Unique `{ student, deviceId }`; **TTL index** `{ lastSeenAt:1 }` `expireAfterSeconds: 21600` (6h).

## API contract

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/api/live-classes` | T·A | Schedule a class |
| GET | `/api/live-classes/list` | A·T | Manage list (`?subject=&status=`) |
| GET/PUT/DELETE | `/api/live-classes/:id` | T·A | Detail / update / cancel |
| PATCH | `/api/live-classes/:id/start` , `/end` | T | Status transitions |
| GET | `/api/live-classes/upcoming` | S | Student's upcoming (entitled subjects) |
| GET | `/api/live-classes/:id/join` | S(gated) | **Mint join token if entitled** |
| POST | `/api/live-classes/:id/attendance/heartbeat` | S | Accrue attendance |
| GET | `/api/live-classes/:id/recording` | S(gated) | Signed recording url |
| GET | `/api/notifications/mine` | any | Paginated notifications |
| PATCH | `/api/notifications/:id/read` | any | Mark read |
| POST | `/api/sessions/heartbeat` | S | Device presence (concurrency cap) |
| GET/DELETE | `/api/sessions/mine` , `/:deviceId` | S | List / kick a device |

### Examples

**POST `/api/live-classes`** (teacher owns the subject)
```json
{ "subject":"<id>", "title":"Live: Rotational Dynamics", "scheduledAt":"2026-07-05T13:00:00+05:45",
  "duration":60, "audience":"paid" }
```
→ 201 `{ "data":{ "_id":"...", "status":"scheduled" }, "message":"Scheduled" }`

**GET `/api/live-classes/:id/join`** (student) — server runs
`hasActiveEntitlement(student, liveClass.subject)`:
- Not entitled (and `audience==='paid'`) → 403 `{ "message":"This live class is for enrolled students." }`
- Entitled → 200 (per-student token, not the raw password)
```json
{ "data": { "joinToken":"<short-lived>", "joinUrl":"https://meet/...?t=...",
  "expiresIn":300 }, "message":"OK" }
```

**POST `/api/live-classes/:id/attendance/heartbeat`** — upsert `Attendance`;
on first join set `joinedAt` + bump `LiveClass.attendeeCount`; on rejoin increment
`sessionCount`; accumulate `totalDurationMinutes`.

**POST `/api/sessions/heartbeat`** — body `{ "deviceId":"<fingerprint>", "deviceType":"web" }`
- Upsert `ActiveSession`; count active rows for the student. If a *new* device would
  exceed `StudentProfile.maxConcurrentDevices` → respond 409 with the current devices
  so the UI can offer **"log out another device"** (kick-oldest), NOT a hard wall.
→ 200 `{ "data":{ "activeDevices":2, "max":2 }, "message":"OK" }`

## Backend rules

- **Join is the gate.** Never expose `meetingPassword`; mint a per-student
  `joinToken` at request time (same philosophy as signed media urls). Free
  (`audience:'free'`) classes skip the entitlement check.
- **Reminder cron** (`backend/cron/liveReminders.js`): every few minutes find
  `scheduled` classes crossing 24h/1h/15m thresholds with the matching
  `notificationsSent.*` still false; create `Notification`s for entitled students;
  flip the flag (idempotent).
- **Notification fan-out service:** for each enabled channel, attempt delivery and
  record `delivery.<channel>` independently (push success + email failure must both
  be representable). Push uses `Device` tokens (any user).
- **Device cap UX:** prefer kick-oldest; the TTL index frees slots from crashed/closed
  clients automatically. A paying student must never be permanently locked out.

## Frontend deliverables

Student (storefront design):
```
store/services/{liveClassApi,notificationApi,sessionApi}.js
components/Student/{UpcomingClasses,LiveJoinButton,NotificationBell,NotificationCenter,DeviceManager}.jsx
screens/App/Student/{LiveClassesScreen,NotificationsScreen}.jsx
```
Teacher/Admin (dashboard design):
```
screens/App/Teacher/LiveClass/{List,Create,Edit,Detail}Screen.jsx   // detail tab: Attendance
```
- Join button fetches a token only when entitled; reminders surface in the bell;
  device manager lists sessions and lets the user kick one.

## Acceptance criteria

- [ ] Teacher schedules/starts/ends a class on their subject; cross-subject = 403.
- [ ] Entitled student joins (token minted); non-entitled is rejected at join.
- [ ] Attendance is unique per (class, student) and accrues across reconnects.
- [ ] Reminders fire once each at 24h/1h/15m to entitled students.
- [ ] Notification with push-success + email-fail records both states independently.
- [ ] Device cap offers kick-oldest, never a hard lockout; TTL frees stale sessions.
