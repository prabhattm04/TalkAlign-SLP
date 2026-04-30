# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TalkAlign is a speech-language pathology (SLP) platform. It has three user roles: **doctor** (SLP therapist), **parent** (caregiver), and **supervisor**. The monorepo has two sub-projects under `TalkAlign-SLP/`:

- `backend/` — Express + TypeScript REST API
- `frontend/` — React 19 + Vite + Tailwind CSS SPA

## Commands

### Backend (`TalkAlign-SLP/backend/`)
```bash
npm run dev          # tsx watch — hot reload via tsx
npm run build        # tsc compile to dist/
npm run start        # node dist/index.js (production)
npm run type-check   # tsc --noEmit
```

### Frontend (`TalkAlign-SLP/frontend/`)
```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run build        # Vite production build
npm run lint         # ESLint
npm run preview      # Preview production build
```

Backend requires a `.env` file at `TalkAlign-SLP/backend/.env` with:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

Frontend reads `VITE_API_URL` (defaults to `http://localhost:3001/api/v1`).

## Backend Architecture

### Request Lifecycle

Every protected route follows this middleware chain:
```
authenticate → requireRole("doctor") → validate(schema) → controller
```

All routes are mounted at `/api/v1/` in `src/index.ts`.

### Supabase Client Strategy — Critical

Two client types in `src/config/supabase.ts`:

- **`supabaseAdmin`** (service role) — bypasses RLS. Used only in `authenticate` middleware (to read `profiles`) and `auth.controller.ts`. Never for user-data queries.
- **`createUserClient(token)`** — user-scoped, respects RLS. Created per-request in `authenticate` and attached to `req.supabase`. Controllers always use `req.supabase!` for data queries so RLS enforces row ownership automatically.

### Auth Middleware (`src/middleware/auth.ts`)

`authenticate` validates the JWT, fetches the user's profile (role is stored in `public.profiles`, not `user_metadata`), and attaches three things to `req`:
- `req.user` — Supabase `User` object
- `req.profile` — `{ id, name, email, role, created_at }` from `profiles` table
- `req.supabase` — user-scoped Supabase client for RLS-enforced queries

`requireRole(...roles)` — factory returning a middleware; must be used after `authenticate`.

### Validation (`src/middleware/validate.ts`)

```ts
validate(schema: ZodSchema, source: "body" | "query" | "params" = "body")
```

On success, replaces `req[source]` with the parsed/transformed value. On failure, returns 400 with Zod field-level errors.

Schemas live in `src/schemas/` and export typed input types alongside the Zod schemas.

### API Response Format

Always use helpers from `src/lib/apiResponse.ts`:
```ts
sendSuccess(data)   // → { success: true, data }
sendError(message)  // → { success: false, error: { message } }
```

Never construct the response shape inline.

### Adding a New Feature Route

1. Create schema in `src/schemas/feature.schema.ts` (Zod + exported types)
2. Create controller in `src/controllers/feature.controller.ts` (use `req.supabase!` for all data queries)
3. Create router in `src/routes/feature.routes.ts` (apply `authenticate` + `requireRole` at router level)
4. Register in `src/index.ts` with `app.use("/api/v1/feature", featureRouter)`

## Database Schema

Key tables (Supabase PostgreSQL):

| Table | Purpose | Ownership column |
|---|---|---|
| `profiles` | Extends `auth.users`; stores `role` | `id` = auth user id |
| `patients` | Speech therapy patients | `doctor_id` |
| `sessions` | Therapy sessions + SOAP notes | `therapist_id` |
| `home_practice_tasks` | Tasks linked to a session | via `session_id` |
| `goals` | Long-term therapy goals | via `patient_id` |

`sessions` SOAP fields: `soap_subjective`, `soap_objective`, `soap_assessment`, `soap_plan`.  
`sessions` status enum: `scheduled`, `in_progress`, `completed`.  
`patients` status enum: `active`, `inactive`, `discharged`.

RLS is enforced by using the user-scoped client (`req.supabase`). Doctors only see their own patients and sessions.

## Frontend Architecture

### State & Data Flow

- **`AuthContext`** — auth state (user, token, isAuthenticated). Persists to `localStorage` as `talkalign_auth`. Token is read from there for all API calls.
- **`DataContext`** — fetches all patients and sessions on mount (when authenticated); exposes mutation wrappers that optimistically update local state.
- **Hooks** (`src/hooks/`) — thin wrappers over `DataContext`. `usePatients()` and `useSessions()` read from context; `usePatient(id)` and `useSession(id)` try context first, fall back to direct API fetch.
- **API layer** (`src/api/`) — `fetchWithAuth` helper reads token from localStorage, calls the backend, throws on error. Mirrors backend route structure.

### Routing

Three protected portals inside `App.jsx`:
- `/dashboard/*` — Doctor UI (`DashboardLayout`)
- `/portal/*` — Caregiver/parent UI (`PortalLayout`)
- `/supervisor/*` — Supervisor UI (`SupervisorLayout`)

All protected by `ProtectedRoute`. Route definitions live exclusively in `App.jsx`.

### UI Conventions

- UI components: `src/components/ui/` (Button, Input, Badge, Card)
- Layout components: `src/components/layout/`
- Tailwind utility classes are used directly; custom classes (e.g. `card`, `form-label`, `section-title`) are defined in `src/index.css`.
- `Badge` accepts a `status` prop and maps values like `active`, `completed`, `in_progress` to colors.
- `lucide-react` is the icon library.

### Adding a New Frontend API Call

Add to the matching `src/api/*.js` file using `fetchWithAuth`. If the response needs to be shared across pages, expose it through `DataContext` and a corresponding hook. For one-off fetches specific to a single page/component, call the API function directly.
