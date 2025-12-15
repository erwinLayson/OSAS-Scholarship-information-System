<!-- Copilot / AI Agent instructions for the OSAS system repo -->

# Quick Orientation

- This repo is a two-part app: a React + Vite frontend (client/) and an Express + MySQL backend (server/).
- Dev hosts: frontend runs on Vite (default port 5173), backend listens on port 3000.

# How the system is wired

- API root mounting (see [server/server.js](server/server.js)): `/applicants`, `/admin`, `/students`, `/scholarships`.
- Auth: JWT tokens are issued and stored in cookies named `adminLogin` and `studentLogin` (see [server/authenticate/auth.js](server/authenticate/auth.js)).
- Database: uses `mysql2` connection configured in [server/config/database.js](server/config/database.js) connecting to database `osas_database`.
- Email: `nodemailer` is configured in [server/controller/shared/mailer.js](server/controller/shared/mailer.js); env vars `PRIVATE_GMAIL`, `APP_CODE`, `SYSTEM_GMAIL` expected.

# Developer workflows (how to run/test/build)

- Start backend: from `server/` run `npm install` then `npm start` (script runs `nodemon server.js`).
- Start frontend: from `client/` run `npm install` then `npm run dev` (Vite dev server).
- Build frontend for production: `cd client && npm run build`.
- Ports and CORS: server allows origin `http://localhost:5173` in [server/server.js](server/server.js). When changing dev ports update CORS origin accordingly.

# Project-specific conventions and patterns

- Controllers: `server/controller/*` are plain JS modules using synchronous-style code with callbacks to model functions (e.g., `model.getAll(callback)` patterns). Inspect [server/controller/adminController.js](server/controller/adminController.js) for examples.
- Models: database access is performed via callback-based functions in `server/model/*` and rely on `mysql2` connection exported from [server/config/database.js](server/config/database.js).
- Error handling: controllers commonly return JSON with `message` and `success` booleans. Follow the same shape for new endpoints.
- Data shapes vary: fields like `student_name`, `created_at`, or `createdDate` are both used in different controllers — write defensive code that handles either form (see recentApplications logic in `adminController.getDashboardStats`).
- Subjects field: sometimes stored as a JSON-string or plain string. When reading, attempt `JSON.parse` and fall back to raw string (see `studentController.getProfile`).
- Passwords: bcrypt is used for hashing and verification in controllers. Token expirations are short (1h).

# Environment variables (important keys)

- ADMIN_LOGIN_SECRET_KEY, STUDENT_LOGIN_SECRET_KEY — JWT signing keys used in `server/authenticate/auth.js` and controllers.
- PRIVATE_GMAIL, APP_CODE, SYSTEM_GMAIL — used by `nodemailer` in `server/controller/shared/mailer.js`.
- Database credentials are in [server/config/database.js] (currently hardcoded for dev). For CI/production, replace with env-driven config.

# Integration & cross-component notes

- Frontend expects backend cookies for auth; CORS must allow credentials (server currently uses `credentials: true`). Keep `sameSite` and `httpOnly` cookie attributes consistent.
- Routes: many admin actions are protected by `authenticateAdmin`; student routes use `authenticateStudent` — reuse these middlewares for any new protected API.

# When you touch code

- Prefer minimal, focused changes. Keep controllers' JSON response shape consistent (message + success). When adding new DB columns, update both model query and any controller parsing (subject handling is a common pitfall).
- Tests: repo doesn't contain automated tests. If adding tests, mirror the callback patterns or wrap model calls into promises for easier unit testing.

# Files to inspect first for context

- [server/server.js](server/server.js)
- [server/config/database.js](server/config/database.js)
- [server/authenticate/auth.js](server/authenticate/auth.js)
- [server/controller/adminController.js](server/controller/adminController.js)
- [server/controller/studentController.js](server/controller/studentController.js)
- [server/controller/shared/mailer.js](server/controller/shared/mailer.js)
- [client/package.json](client/package.json)
- [server/package.json](server/package.json)

If any section is unclear or you'd like more detail (examples, missing env keys, or test scaffolding), tell me which area to expand.
