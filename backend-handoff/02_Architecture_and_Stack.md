# 02 — Architecture and Stack

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM/Client:** `@supabase/supabase-js` (interacting directly with Supabase PostgreSQL)
- **Auth Provider:** Supabase Auth
- **File Storage:** Supabase Storage
- **Validation:** Zod
- **AI Integration:** `openai` SDK

## Architecture Decisions
* **Stateless API:** Express should be stateless. Auth state is managed via Supabase JWTs.
* **Backend serves as a secure proxy:** The frontend does not talk to Supabase DB/Storage directly using an anon key. All interactions must route through the Express API so the backend can orchestrate AI pipelines and ensure security.
* **Supabase Client Strategy:** The Express server should extract the user's JWT from the `Authorization` header and instantiate a scoped Supabase client for DB operations, ensuring Row Level Security (RLS) is respected automatically.

## Recommended Folder Structure

```text
backend/
├── src/
│   ├── index.ts               # Express app and server startup
│   ├── config/
│   │   ├── env.ts             # Zod validation for process.env
│   │   └── supabase.ts        # Supabase client helpers
│   ├── middleware/
│   │   ├── auth.ts            # Validates Supabase JWTs
│   │   └── validate.ts        # Express request validation (Zod)
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── patients.routes.ts
│   │   ├── sessions.routes.ts
│   │   ├── goals.routes.ts
│   │   └── portal.routes.ts
│   ├── controllers/
│   │   └── ...
│   ├── services/
│   │   └── ai.service.ts      # Whisper and GPT wrappers
│   └── schemas/
│       └── ...                # Zod DTO definitions
├── package.json
├── tsconfig.json
└── .env
```

## Required Environment Variables
```env
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey... (For admin tasks like bypassing RLS during AI webhook processing)
SUPABASE_ANON_KEY=ey...

# OpenAI
OPENAI_API_KEY=sk-...
```

## Error Handling Pattern
The API should always return standard JSON structures.

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Resource not found"
  }
}
```
