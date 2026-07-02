# 03 — Part 2: Catalog & Content

> Prepend `00-standards.md` before running this prompt.

## Mission

Let admin/teacher author the full academic tree
`Program → BScYear → Subject → Chapter → Content`, and let students browse only
their own program's catalog with correct free-preview / paid gating. Media is
served via short-TTL signed URLs with per-viewer watermark. Admin/Teacher screens
use the can-logistic dashboard design; the **student catalog uses its own
consumer/edtech design**.

## Dependencies

Part 1 (User, roles, `TeacherProfile.assignedSubjects`, `StudentProfile.program`).

## Models

### `Program` (`models/Program.js`)
```
name:String required | slug:String (partial-unique) | code:String
description:String | thumbnail:String | durationYears:Number default 4
isActive:Boolean default false | isDeleted/deletedAt
totalStudents:Number default 0   // cached
```

### `BScYear` (`models/BScYear.js`)
```
program:ObjectId ref Program required
yearNumber:Number 1..4 | yearName:String enum ['1st Year'..'4th Year']
description:String | thumbnail:String
bundlePrice:{ originalPrice:Number req, discountedPrice:Number req, currency:'NPR' }
isActive:Boolean default false | launchDate:Date | isDeleted/deletedAt
totalSubjects:Number default 0 | totalStudents:Number default 0
```
**Compound unique `{ program, yearNumber }`** (partial on `isDeleted:false`).

### `Subject` (`models/Subject.js`)
```
program:ObjectId ref Program required        // denormalized for catalog queries
year:ObjectId ref BScYear required
semester:Number 1..8 (nullable)              // future-proofing; not used for pricing now
subjectCode:String | name:String required | slug:String
description:String maxlength 2000 | thumbnail:String
category:String enum ['Core','Elective','Practical','Ability Enhancement'] default 'Core'
displayOrder:Number default 0
pricing:{ originalPrice:Number req, discountedPrice:Number req, currency:'NPR', validityDays:Number default 365 }
totalChapters/totalVideos/totalPdfs/totalNotes/totalLiveClasses: Number default 0  // cached
ratingAverage:Number default 0 | ratingCount:Number default 0                       // cached
isActive:Boolean default false | isDeleted/deletedAt
tags:[String] | metaTitle:String | metaDescription:String
```
Indexes: `{ year, isActive, displayOrder }`; **`slug` unique per `{ program, year }`**
and **`subjectCode` unique per `{ program, year }`** (partial on `isDeleted:false`);
text index `{ name, description, tags }`.

### `Chapter` (`models/Chapter.js`)
```
subject:ObjectId ref Subject required
chapterNumber:Number required | title:String required | slug:String | description:String
learningObjectives:[String] | topics:[String] | estimatedDuration:Number
isFreePreview:Boolean default false   // unlocks ALL content in this chapter
isPublished:Boolean default false | publishedAt:Date | isDeleted/deletedAt
videoCount/pdfCount/noteCount/quizCount:Number default 0
```
Index `{ subject, chapterNumber }`.

### `Content` (`models/Content.js`)
```
chapter:ObjectId ref Chapter required | uploadedBy:ObjectId ref User required
type:String enum ['video','pdf','note','audio','link'] required
title:String required | description:String
order:Number default 0                  // sequence within chapter ("next lesson")
status:String enum ['uploading','processing','ready','failed'] default 'uploading'
isDeleted/deletedAt
storage:{ provider:enum['s3','cloudflare-stream','gumlet','bunny','local'], fileKey:String req, fileSize:Number, fileFormat:String }
videoData:{ durationSeconds:Number, resolution:String, thumbnailUrl:String, playbackId:String, subtitlesUrl:String, watermarkEnabled:Boolean default true }
pdfData:{ pageCount:Number, previewUrl:String, isDownloadable:Boolean default false }
noteData:{ content:String, isDownloadable:Boolean default true }
isFree:Boolean default false            // standalone free item outside a free-preview chapter
viewCount/downloadCount:Number default 0
isPublished:Boolean default false | publishedAt:Date
```
Indexes `{ chapter, type }`, `{ uploadedBy }`.

## API contract

Legend: A=admin, T=teacher (scoped to `assignedSubjects`), S=student, P=public.

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST/GET | `/api/programs` , `/api/programs/list` | A / A·T | create / paginated list |
| GET/PUT/DELETE | `/api/programs/:id` | A | detail / update / soft-delete |
| GET | `/api/programs/active` | P·S | active programs (student signup, catalog) |
| POST/GET | `/api/years` , `/api/years/list` | A / A·T | create / list (filter `?program=`) |
| GET/PUT/DELETE | `/api/years/:id` | A | detail / update / soft-delete |
| POST/GET | `/api/subjects` , `/api/subjects/list` | A·T / A·T | create / list (`?program=&year=&search=`) |
| GET/PUT/DELETE | `/api/subjects/:id` | A·T | detail / update / soft-delete |
| GET | `/api/subjects/slug/:slug` | P·S | public/student subject page |
| POST/GET | `/api/chapters` , `/api/chapters/list` | T·A / any | create / list (`?subject=`) |
| GET/PUT/DELETE | `/api/chapters/:id` | T·A | detail / update / soft-delete |
| POST | `/api/contents` | T·A | create content record (pre-upload) |
| POST | `/api/contents/:id/upload-url` | T·A | get a signed PUT url for the file |
| PATCH | `/api/contents/:id/status` | T·A·system | transcode webhook → ready/failed |
| GET | `/api/contents/list` | any | list (`?chapter=&type=`) |
| GET | `/api/contents/:id/play` | S (gated) | **mint short-TTL signed playback url** |
| GET | `/api/contents/:id/download` | S (gated) | mint download url (if downloadable) |
| GET | `/api/catalog/me` | S | student's program catalog tree |

### Examples

**POST `/api/subjects`** (teacher must own it via `assignedSubjects`, or admin)
```json
{ "program":"<id>", "year":"<id>", "name":"Physics I", "subjectCode":"PHY101",
  "category":"Core", "pricing":{ "originalPrice":2500, "discountedPrice":1999 },
  "tags":["mechanics","waves"] }
```
→ 201 `{ "data": { "_id":"...", "slug":"physics-i", ... }, "message":"Subject created" }`

**GET `/api/subjects/list?program=<id>&year=<id>&page=1&limit=10`** → 200
```json
{ "data": [ { "_id":"...", "name":"Physics I", "pricing":{...},
  "totalChapters":8, "ratingAverage":4.6 } ], "totalItems": 12, "message":"OK" }
```

**GET `/api/contents/:id/play`** (student) — server runs `canAccess(...)`:
- Not entitled & not free → 403 `{ "message":"Purchase required to watch this." }`
- Entitled/free → 200
```json
{ "data": { "playbackUrl":"https://cdn/...sig=...&exp=...",
  "watermark":"a@x.com·<userId>", "expiresIn":120 }, "message":"OK" }
```

**GET `/api/catalog/me`** (student) → 200 — only the student's `program`, only
published/active:
```json
{ "data": { "program": {...}, "years": [ { "yearNumber":1,
  "subjects":[ { "_id":"...", "name":"Physics I", "entitled":true,
  "pricing":{...} } ] } ] }, "message":"OK" }
```

## Backend rules

- **Teacher scope:** for any Subject/Chapter/Content write, assert the subject is
  in `req.user`'s `TeacherProfile.assignedSubjects` (admin bypasses). 403 otherwise.
- **Counters:** maintain `Subject.totalChapters/totalVideos/...`, `BScYear.totalSubjects`
  in service functions on create/delete.
- **Upload pipeline:** create `Content`(`status:'uploading'`) → return signed PUT
  url → client uploads → provider/transcode callback → `PATCH .../status` →
  `processing`→`ready` (set `videoData.playbackId`, duration). Only `ready`+`isPublished`
  content is playable.
- **Signed URLs:** `/play` and `/download` mint short-TTL urls from `storage.fileKey`;
  never persist a public url. Always run `canAccess`.
- **Student catalog:** filtered by `StudentProfile.program`; each subject annotated
  with `entitled` via an Entitlement lookup (Entitlement model lands in Part 3 — until
  then default `entitled:false`/free-preview only).

## Frontend deliverables

### Admin/Teacher (can-logistic dashboard design)
```
store/services/{programApi,yearApi,subjectApi,chapterApi,contentApi}.js   # injectEndpoints
routers/{ProgramRouter,YearRouter,SubjectRouter,ChapterRouter}.jsx        # CRUD quartet routes
screens/App/Admin/Program/{List,Create,Edit,Detail}Screen.jsx
screens/App/Teacher/Subject/{List,Detail}Screen.jsx                       # detail tabs: Chapters | Content | Live Classes
components/.../forms (react-hook-form + BaseAutocomplete for program/year refs)
```
- Subject Detail publishes its record via a `SubjectDetailContext` for nested tabs
  (`CustomTabs` + `CustomTabPanel`), exactly like can-logistic's `BranchDetailTabs`.

### Student (own consumer/edtech design)
```
screens/App/Student/{ProgramLanding,YearScreen,SubjectScreen}.jsx
components/Student/{CourseCard,Hero,SectionTabs,VideoPlayer,Paywall}.jsx
```
- `SubjectScreen` shows sections: **Notes · Chapters · PDFs · Recorded Videos**;
  free-preview items play, paid items show `Paywall` with the buy CTA (Part 3 wires checkout).
- Course cards (cover-forward), clean typography — NOT the admin table look.

## Acceptance criteria

- [ ] Admin builds Program → Year → Subjects → Chapters → Content end to end.
- [ ] A teacher can only create/edit content under their assigned subjects (others → 403).
- [ ] Student sees only their program's published catalog via `/api/catalog/me`.
- [ ] Free-preview content plays (signed url minted); paid content returns 403 with no url.
- [ ] Lists paginate via `$facet` and URL params; counters stay in sync on create/delete.
- [ ] Uploading a video walks `uploading → processing → ready`; only ready+published is playable.
