# 05 — Part 4: Learning Experience

> Prepend `00-standards.md` before running this prompt.

## Mission

Let students progress through content (resume video, mark complete), self-assess
with quizzes (without leaking answer keys), and earn a certificate on completion.
Every read/write here is gated by the shared `canAccess` function.

## Dependencies

Part 2 (Chapter/Content), Part 3 (Entitlement — gating is now real).

## Models

### `Progress` (`models/Progress.js`)
```
student:ref User req | content:ref Content req
watchTime:Number default 0 (sec) | isCompleted:Boolean default false | completedAt:Date
lastPosition:Number default 0 | isDownloaded:Boolean default false | downloadedAt:Date
```
Unique `{ student, content }`; index `{ student, isCompleted }`.

### `Quiz` (`models/Quiz.js`)
```
chapter:ref Chapter req | title:String req | description:String
questions:[{ questionText:String req, options:[String] req, correctOptionIndex:Number req,
             explanation:String, points:Number default 1 }]
passingScore:Number default 50 (%) | timeLimitMinutes:Number | maxAttempts:Number default 0 (0=∞)
isPublished:Boolean default false
```
Index `{ chapter }`.

### `QuizAttempt` (`models/QuizAttempt.js`)
```
student:ref User req | quiz:ref Quiz req
answers:[{ questionIndex:Number req, selectedOptionIndex:Number, isCorrect:Boolean }]
score:Number req (%) | totalPoints:Number | earnedPoints:Number | attemptNumber:Number req
startedAt:Date | submittedAt:Date
```
Unique `{ student, quiz, attemptNumber }`.

### `Certificate` (`models/Certificate.js`)
```
student:ref User req | subject:ref Subject req
certificateNumber:String req unique | completionPercentage:Number default 100 | issuedAt:Date default now
storage:{ provider:enum[...], fileKey:String } | templateVersion:String
```
Unique `{ student, subject }`.

## API contract

| Method | Path | Role | Purpose |
|---|---|---|---|
| PUT | `/api/progress` | S(gated) | Upsert watch progress for a content |
| GET | `/api/progress/subject/:subjectId` | S(gated) | Progress map for a subject |
| POST | `/api/quizzes` , CRUD | T·A | Author quizzes (answer keys included) |
| GET | `/api/quizzes/:id` | S(gated) | Quiz WITHOUT answer keys |
| POST | `/api/quizzes/:id/attempts` | S(gated) | Start an attempt |
| POST | `/api/quizzes/:id/attempts/:attemptId/submit` | S(gated) | Submit + score |
| GET | `/api/quizzes/:id/attempts/mine` | S | My attempts (with explanations, post-submit) |
| GET | `/api/certificates/mine` | S | My certificates |
| POST | `/api/certificates/issue` | system·A | Issue on completion threshold |
| GET | `/api/certificates/:number/verify` | public | Public certificate verification |

### Examples

**PUT `/api/progress`**
```json
{ "content":"<id>", "watchTime":312, "lastPosition":300, "isCompleted":false }
```
- Run `canAccess`; upsert by `{student,content}`; clamp `watchTime` monotonic;
  set `completedAt` when `isCompleted` flips true; bump `StudentProfile.completedChaptersCount`
  via rollup when all of a chapter's content is complete.
→ 200 `{ "data":{ "lastPosition":300, "isCompleted":false }, "message":"Saved" }`

**GET `/api/quizzes/:id`** (student) → 200 — **answer keys stripped**:
```json
{ "data": { "_id":"...", "title":"Kinematics Quiz", "timeLimitMinutes":15,
  "questions":[ { "questionText":"...", "options":["a","b","c","d"], "points":1 } ] },
  "message":"OK" }
```
(`correctOptionIndex` and `explanation` MUST NOT appear here.)

**POST `/api/quizzes/:id/attempts/:attemptId/submit`**
```json
{ "answers":[ { "questionIndex":0, "selectedOptionIndex":2 } ] }
```
- Score server-side against stored keys; compute `score`, `earnedPoints`,
  per-answer `isCorrect`; enforce `maxAttempts` + `timeLimitMinutes`.
→ 200
```json
{ "data": { "score":80, "passed":true, "earnedPoints":4, "totalPoints":5,
  "answers":[ { "questionIndex":0, "selectedOptionIndex":2, "isCorrect":true,
  "explanation":"..." } ] }, "message":"Submitted" }
```

**POST `/api/certificates/issue`** — when a student's subject completion ≥ threshold,
issue once (`certificateNumber` like `BSC-CERT-YYYY-XXXXX`), render PDF to storage.
→ 201 `{ "data":{ "certificateNumber":"...", "storage":{...} }, "message":"Issued" }`

## Backend rules

- Every student endpoint resolves `canAccess(content/chapter/subject)` first.
- Quiz GET for students uses a **projection** that excludes `questions.correctOptionIndex`
  and `questions.explanation`. Author/teacher GET includes them.
- Attempt numbering is server-assigned (`prevMax + 1`); reject when over `maxAttempts`.
- Certificate issuance is idempotent (unique `{student,subject}`); recompute, don't duplicate.

## Frontend deliverables (student storefront design)

```
store/services/{progressApi,quizApi,certificateApi}.js
components/Student/{VideoPlayer (resume via lastPosition + progress reporting),
                   ContentList (completion ticks, "next" via Content.order),
                   QuizRunner (timer, attempts), QuizResult (explanations post-submit),
                   CertificateCard}.jsx
screens/App/Student/{LearnScreen, QuizScreen, CertificatesScreen}.jsx
teacher: screens/App/Teacher/Quiz/{List,Create,Edit}Screen.jsx (dashboard design)
```
- Player reports `watchTime`/`lastPosition` periodically (throttled) and on pause/unmount.

## Acceptance criteria

- [ ] Progress persists and resumes at `lastPosition`; completion ticks render.
- [ ] Student quiz GET never includes answer keys; submit scores correctly server-side.
- [ ] `maxAttempts` and `timeLimitMinutes` enforced.
- [ ] Certificate issues exactly once at the completion threshold; public verify works.
- [ ] Non-entitled access to any of these endpoints returns 403 with no media url.
