# 01 — Part 0: Foundation

> Prepend `00-standards.md` before running this prompt.

## Mission

Stand up the monorepo and a running-but-empty skeleton of both apps. **No domain
models, no auth enforcement, no business logic.** When this part is done, both
apps start with one command, the backend connects to Mongo, and a single health
endpoint answers in the standard response shape.

## Dependencies

None. This is the first part.

## Backend deliverables

### File tree
```
backend/
├── server.js
├── config/
│   ├── db.config.js
│   ├── env.config.js
│   └── cors.config.js
├── middlewares/
│   ├── errorMiddleware.js      # ERROR_HANDLER + NOT_FOUND_HANDLER
│   └── authMiddleware.js       # export `protect` STUB (throws "not implemented"); filled in Part 1
├── routes/
│   └── healthRoutes.js
├── controllers/
│   └── healthController.js
└── package.json                # "type":"module", deps + nodemon
```

### `server.js` requirements
- Load env, `await connectDB()`, create `app` and `http.createServer(app)`.
- `app.use(express.json({ limit: "10mb" }))`.
- `app.use(cors(await getCorsOptions()))`.
- Mount `app.use("/api/health", healthRoutes)`.
- In `production`, serve `frontend/dist` and SPA-fallback to `index.html`
  (Vite builds to `dist/`, not CRA's `build/`).
- `app.use(ERROR_HANDLER)` then `app.use(NOT_FOUND_HANDLER)`.
- `server.listen(PORT)`; `process.on("unhandledRejection")` +
  `process.on("uncaughtException")` log-only guards.

### `errorMiddleware.js`
- `NOT_FOUND_HANDLER`: builds a 404 `Error` from `req.originalUrl`.
- `ERROR_HANDLER`: maps Mongo `11000` → duplicate message, Mongoose `required` →
  "Missing required fields: …", responds `{ message, ...(dev && { stack }) }`,
  status = `res.statusCode === 200 ? 500 : res.statusCode`.

### Root `package.json` scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon backend/server.js",
    "client": "npm --prefix frontend run dev",
    "build": "npm --prefix frontend run build",
    "start": "node backend/server.js"
  }
}
```

## Frontend deliverables

Move the existing Vite app into `frontend/` and add:

### File tree (added/changed)
```
frontend/src/
├── main.jsx                    # providers: BrowserRouter > Provider(store) > App
├── App.jsx                     # top-level <Routes> shell (placeholder routes)
├── store/
│   ├── index.js                # configureStore: { [baseApi.reducerPath]: baseApi.reducer } + middleware
│   └── services/baseApi.js     # createApi, baseUrl "/api", prepareHeaders Bearer, central tagTypes (can be [] for now)
├── layouts/
│   ├── SidebarLayout/          # AppBar (header) + Drawer (sidebar slot) + <Outlet/>
│   └── BreadcrumbLayout.jsx    # compound: BreadcrumbLayout.Paper, BreadcrumbLayout.Error
├── components/Shared/
│   ├── CustomTabs.jsx          # URL-driven (?tab=) MUI Tabs
│   ├── CustomTabPanel.jsx
│   └── AppTable.jsx            # react-data-table wrapper, server pagination
└── hooks/
    └── useTablePagination.js   # reads page/perPage from URL, returns handlers
```

### Behavior
- `baseApi` defined but with zero domain endpoints (or just a placeholder).
- `SidebarLayout` renders a header bar + a collapsible drawer with an empty
  sidebar **slot** (the role sidebar is injected in Part 1) + an `<Outlet/>`.
- Shared components compile and are exported, ready for Part 2 to consume.

## API contract

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/api/health` | public | Liveness + Mongo status |

**`GET /api/health` → 200**
```json
{ "data": { "status": "ok", "db": "connected", "env": "development" }, "message": "healthy" }
```

## Acceptance criteria

- [ ] `npm install` at root + in `frontend/` + in `backend/` succeeds.
- [ ] `npm run dev` boots backend (nodemon) and frontend (Vite) together.
- [ ] `GET /api/health` returns the exact shape above with `db:"connected"`.
- [ ] Backend logs `Server 🚀 in development at <PORT>` and the Mongo connection.
- [ ] Frontend renders the empty `SidebarLayout` shell at `/`.
- [ ] `protect` exists as a stub and is imported by `authMiddleware.js` without
      breaking the build.
- [ ] No domain models, no real routes beyond health.

## Notes / edge cases

- Vite dev server proxy: configure `server.proxy` in `vite.config.js` so `/api`
  forwards to `http://localhost:5000` in dev (mirrors can-logistic's CRA `proxy`).
- Keep `tagTypes` centralized even if empty — Parts 1–6 append to it.
- Do not scaffold MUI theming decisions yet beyond what `SidebarLayout` needs.
