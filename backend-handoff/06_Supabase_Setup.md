# 06 — Supabase Setup & Configuration

This document specifies how Supabase needs to be configured for the TalkAlign backend.

## 1. Authentication Configuration

We will use **Email & Password** auth via Supabase.

### Handling Custom Roles
Supabase does not have built-in "Roles" beyond Postgres roles. 
We handle roles via the `profiles` table.

```sql
-- Create a custom type for roles
CREATE TYPE user_role AS ENUM ('doctor', 'parent');

-- Create the profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Auto-Creating Profiles (Trigger)
When the Express API calls `supabase.auth.signUp()`, we need a database trigger to insert the corresponding row into the `profiles` table.

```sql
-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.email, 
    (new.raw_user_meta_data->>'role')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 2. Row Level Security (RLS) Policies

Since the Express backend will instantiate the Supabase client using the user's JWT (`createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } })`), we must define RLS policies in the database.

### `patients` table
* **Doctor:** Can `SELECT`, `INSERT`, `UPDATE` where `doctor_id = auth.uid()`
* **Parent:** Can `SELECT` where `caregiver_id = auth.uid()`

### `sessions` table
* **Doctor:** Can `SELECT`, `INSERT`, `UPDATE` where `therapist_id = auth.uid()`
* **Parent:** Can `SELECT` where patient belongs to them (`patient_id IN (SELECT id FROM patients WHERE caregiver_id = auth.uid())`)

### `home_practice_tasks` table
* **Doctor:** Can `SELECT`, `INSERT`, `UPDATE` on tasks belonging to their sessions.
* **Parent:** Can `SELECT` and `UPDATE` (only the `completed` field) on tasks belonging to their children's sessions.

## 3. Storage Configuration

1. Create a Storage Bucket named `session-audio`.
2. Make the bucket **Private** (Not public).
3. **RLS on Storage:**
   * **Insert:** Only `doctor` role can upload audio files.
   * **Select:** Backend (Service Role) can read audio to send to OpenAI Whisper.

When the Express API uploads audio, it should use the authenticated Supabase client so RLS applies, or it can use the Service Role key if the backend performs the upload as an admin operation after validating the user via Express middleware.
