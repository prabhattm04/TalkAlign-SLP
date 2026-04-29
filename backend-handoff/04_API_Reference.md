# 04 — API Reference

All backend API routes must be prefixed with `/api/v1`.
Authentication is managed via `Authorization: Bearer <token>` using Supabase JWTs.

---

## 1. Auth Endpoints

> **Note:** The frontend currently sends `email` and `password` to the custom backend instead of talking directly to Supabase. The backend Express API will proxy these requests to `supabase.auth.signInWithPassword()` and return the session.

### POST /api/v1/auth/login
```json
// Request
{
  "email": "doctor@talkalign.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Dr. Aisha Nair",
      "email": "doctor@talkalign.com",
      "role": "doctor"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### POST /api/v1/auth/register
Registers user in Supabase Auth and creates a profile in the `profiles` table via a Supabase trigger (or backend transaction).

### POST /api/v1/auth/logout
Calls Supabase `signOut()`.

---

## 2. Patients (Doctor Only)

### GET /api/v1/patients
Returns all patients assigned to the logged-in doctor.
*Response array of patient objects with nested recent session counts.*

### GET /api/v1/patients/:id
Returns specific patient details.

### POST /api/v1/patients
Creates a new patient under the logged-in doctor.

### PATCH /api/v1/patients/:id
Updates patient data.

### DELETE /api/v1/patients/:id
Soft-delete (update status to `discharged`).

---

## 3. Sessions (Doctor Only)

### GET /api/v1/sessions
Returns all sessions for the logged-in doctor's patients. Query parameters: `?patientId=xyz`.

### GET /api/v1/sessions/:id
Returns full session details including SOAP notes and transcript.

### POST /api/v1/sessions
Creates a new session in `in_progress` status.

### POST /api/v1/sessions/:id/soap
Saves the drafted SOAP note and marks session status as `completed`.
```json
// Request
{
  "soap": {
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "..."
  }
}
```

### POST /api/v1/sessions/:id/home-practice
Assigns home practice tasks to a session.
```json
// Request
{
  "tasks": [
    { "title": "Practice reading /r/ words" }
  ]
}
```

---

## 4. Audio & AI Processing (Doctor Only)

### POST /api/v1/sessions/:id/audio
Accepts a `multipart/form-data` file upload (`audio/webm`).
* **Immediate Response:** `{ "success": true, "status": "processing" }`
* **Async Action:** The backend uploads the audio to Supabase Storage, calls Whisper, calls GPT for SOAP, calls GPT for parent summary, and updates the session row in the database.
* The frontend will poll `GET /api/v1/sessions/:id` every 2 seconds to check if status updated to `draft`.

---

## 5. Goals (Doctor Only)

### GET /api/v1/goals?patientId=uuid
Returns goals, including nested objectives and activities.

### POST /api/v1/goals
Creates a new goal.

### PATCH /api/v1/goals/:id
Updates a goal status.

---

## 6. Caregiver Portal (Parent Only)

> **Access Control:** The JWT must have `role: 'parent'`.

### GET /api/v1/portal/me
Returns the caregiver profile and the list of patients assigned to them.
```json
{
  "success": true,
  "data": {
    "caregiver": { "id": "...", "name": "..." },
    "patients": [ { "id": "...", "name": "Aarav" } ]
  }
}
```

### GET /api/v1/portal/sessions
Returns all sessions for the caregiver's children.
* **Important:** This endpoint MUST NOT return `soap_subjective`, `soap_objective`, etc. It must ONLY return `ai_parent_summary` and home practice tasks.

### PATCH /api/v1/portal/tasks/:taskId/complete
Marks a home practice task as completed.
```json
// Request
{ "completed": true }
```
