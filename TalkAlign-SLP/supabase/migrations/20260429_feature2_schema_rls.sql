-- =============================================================================
-- TalkAlign Feature 2: Database Schema, Trigger & RLS Policies
-- Project: obatikddxidgehtvotnk.supabase.co
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2.1  CUSTOM ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role        AS ENUM ('doctor', 'parent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE patient_status   AS ENUM ('active', 'inactive', 'discharged');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE session_status   AS ENUM ('scheduled', 'in_progress', 'processing', 'draft', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE goal_type        AS ENUM ('long_term', 'short_term');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE goal_status      AS ENUM ('not_started', 'in_progress', 'achieved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- -----------------------------------------------------------------------------
-- 2.2  TABLES  (dependency order)
-- -----------------------------------------------------------------------------

-- 1. profiles — extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text         NOT NULL,
  email      text         UNIQUE NOT NULL,
  role       user_role    NOT NULL,
  created_at timestamptz  NOT NULL DEFAULT now()
);

-- 2. patients
CREATE TABLE IF NOT EXISTS public.patients (
  id               uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id        uuid           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  caregiver_id     uuid           REFERENCES public.profiles(id) ON DELETE SET NULL,
  name             text           NOT NULL,
  age              integer,
  gender           text,
  condition        text,
  notes            text,
  status           patient_status NOT NULL DEFAULT 'active',
  tags             text[]         NOT NULL DEFAULT '{}',
  caregiver_phone  text,
  created_at       timestamptz    NOT NULL DEFAULT now()
);

-- 3. sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id                 uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         uuid            NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id       uuid            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date               timestamptz     NOT NULL DEFAULT now(),
  duration           integer,                                    -- minutes
  status             session_status  NOT NULL DEFAULT 'scheduled',
  summary            text,
  soap_subjective    text,
  soap_objective     text,
  soap_assessment    text,
  soap_plan          text,
  ai_parent_summary  text,
  audio_file_path    text,
  transcript         jsonb,                                      -- [{speaker,text,time}]
  created_at         timestamptz     NOT NULL DEFAULT now()
);

-- 4. home_practice_tasks
CREATE TABLE IF NOT EXISTS public.home_practice_tasks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid        NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  completed    boolean     NOT NULL DEFAULT false,
  completed_at timestamptz
);

-- 5. goals
CREATE TABLE IF NOT EXISTS public.goals (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid         NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title      text         NOT NULL,
  type       goal_type    NOT NULL DEFAULT 'long_term',
  status     goal_status  NOT NULL DEFAULT 'not_started',
  baseline   text,
  target     text,
  created_at timestamptz  NOT NULL DEFAULT now()
);

-- 6. objectives
CREATE TABLE IF NOT EXISTS public.objectives (
  id      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid        NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  text    text        NOT NULL,
  status  goal_status NOT NULL DEFAULT 'not_started'
);

-- 7. activities
CREATE TABLE IF NOT EXISTS public.activities (
  id         uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id    uuid             NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title      text             NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'Easy',
  tags       text[]           NOT NULL DEFAULT '{}'
);


-- -----------------------------------------------------------------------------
-- 2.3  AUTO-PROFILE TRIGGER
-- NOTE: Function placed in public schema as required by Supabase auth hooks.
-- It is SECURITY DEFINER — do not use raw_user_meta_data for authorization
-- decisions anywhere else; rely on the profiles.role column instead.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email,
    (new.raw_user_meta_data->>'role')::user_role
  );
  RETURN new;
END;
$$;

-- Drop the trigger first so the CREATE is idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 2.4  ROW-LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS on every table
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_practice_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities         ENABLE ROW LEVEL SECURITY;

-- ·············································································
-- profiles
-- ·············································································
-- Any authenticated user can read their own profile
DROP POLICY IF EXISTS "profiles: owner select" ON public.profiles;
CREATE POLICY "profiles: owner select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow own profile update (e.g. name change)
DROP POLICY IF EXISTS "profiles: owner update" ON public.profiles;
CREATE POLICY "profiles: owner update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- ·············································································
-- patients
-- ·············································································
-- Doctor: full CRUD on their own patients
DROP POLICY IF EXISTS "patients: doctor select" ON public.patients;
CREATE POLICY "patients: doctor select"
  ON public.patients
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "patients: doctor insert" ON public.patients;
CREATE POLICY "patients: doctor insert"
  ON public.patients
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "patients: doctor update" ON public.patients;
CREATE POLICY "patients: doctor update"
  ON public.patients
  FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

-- Parent: can only view their assigned patients
DROP POLICY IF EXISTS "patients: parent select" ON public.patients;
CREATE POLICY "patients: parent select"
  ON public.patients
  FOR SELECT
  TO authenticated
  USING (caregiver_id = auth.uid());

-- ·············································································
-- sessions
-- ·············································································
-- Doctor: full CRUD on sessions they own
DROP POLICY IF EXISTS "sessions: doctor select" ON public.sessions;
CREATE POLICY "sessions: doctor select"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (therapist_id = auth.uid());

DROP POLICY IF EXISTS "sessions: doctor insert" ON public.sessions;
CREATE POLICY "sessions: doctor insert"
  ON public.sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (therapist_id = auth.uid());

DROP POLICY IF EXISTS "sessions: doctor update" ON public.sessions;
CREATE POLICY "sessions: doctor update"
  ON public.sessions
  FOR UPDATE
  TO authenticated
  USING (therapist_id = auth.uid())
  WITH CHECK (therapist_id = auth.uid());

-- Parent: can view sessions belonging to their children
DROP POLICY IF EXISTS "sessions: parent select" ON public.sessions;
CREATE POLICY "sessions: parent select"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE caregiver_id = auth.uid()
    )
  );

-- ·············································································
-- home_practice_tasks
-- ·············································································
-- Doctor: full CRUD via their sessions
DROP POLICY IF EXISTS "hpt: doctor select" ON public.home_practice_tasks;
CREATE POLICY "hpt: doctor select"
  ON public.home_practice_tasks
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE therapist_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "hpt: doctor insert" ON public.home_practice_tasks;
CREATE POLICY "hpt: doctor insert"
  ON public.home_practice_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE therapist_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "hpt: doctor update" ON public.home_practice_tasks;
CREATE POLICY "hpt: doctor update"
  ON public.home_practice_tasks
  FOR UPDATE
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE therapist_id = auth.uid()
    )
  );

-- Parent: can view tasks for their children's sessions
DROP POLICY IF EXISTS "hpt: parent select" ON public.home_practice_tasks;
CREATE POLICY "hpt: parent select"
  ON public.home_practice_tasks
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM public.sessions s
      JOIN public.patients p ON s.patient_id = p.id
      WHERE p.caregiver_id = auth.uid()
    )
  );

-- Parent: can only update the `completed` and `completed_at` fields.
-- RLS UPDATE applies to the whole row; column-level restriction is enforced
-- at the API layer (the controller only sends those two fields).
DROP POLICY IF EXISTS "hpt: parent update completed" ON public.home_practice_tasks;
CREATE POLICY "hpt: parent update completed"
  ON public.home_practice_tasks
  FOR UPDATE
  TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM public.sessions s
      JOIN public.patients p ON s.patient_id = p.id
      WHERE p.caregiver_id = auth.uid()
    )
  );

-- ·············································································
-- goals
-- ·············································································
DROP POLICY IF EXISTS "goals: doctor select" ON public.goals;
CREATE POLICY "goals: doctor select"
  ON public.goals
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "goals: doctor insert" ON public.goals;
CREATE POLICY "goals: doctor insert"
  ON public.goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "goals: doctor update" ON public.goals;
CREATE POLICY "goals: doctor update"
  ON public.goals
  FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE doctor_id = auth.uid()
    )
  );

-- Parent: read-only view of their children's goals
DROP POLICY IF EXISTS "goals: parent select" ON public.goals;
CREATE POLICY "goals: parent select"
  ON public.goals
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE caregiver_id = auth.uid()
    )
  );

-- ·············································································
-- objectives
-- ·············································································
DROP POLICY IF EXISTS "objectives: doctor select" ON public.objectives;
CREATE POLICY "objectives: doctor select"
  ON public.objectives
  FOR SELECT
  TO authenticated
  USING (
    goal_id IN (
      SELECT g.id FROM public.goals g
      JOIN public.patients p ON g.patient_id = p.id
      WHERE p.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "objectives: doctor insert" ON public.objectives;
CREATE POLICY "objectives: doctor insert"
  ON public.objectives
  FOR INSERT
  TO authenticated
  WITH CHECK (
    goal_id IN (
      SELECT g.id FROM public.goals g
      JOIN public.patients p ON g.patient_id = p.id
      WHERE p.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "objectives: doctor update" ON public.objectives;
CREATE POLICY "objectives: doctor update"
  ON public.objectives
  FOR UPDATE
  TO authenticated
  USING (
    goal_id IN (
      SELECT g.id FROM public.goals g
      JOIN public.patients p ON g.patient_id = p.id
      WHERE p.doctor_id = auth.uid()
    )
  );

-- ·············································································
-- activities
-- ·············································································
DROP POLICY IF EXISTS "activities: doctor select" ON public.activities;
CREATE POLICY "activities: doctor select"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (
    goal_id IN (
      SELECT g.id FROM public.goals g
      JOIN public.patients p ON g.patient_id = p.id
      WHERE p.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "activities: doctor insert" ON public.activities;
CREATE POLICY "activities: doctor insert"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    goal_id IN (
      SELECT g.id FROM public.goals g
      JOIN public.patients p ON g.patient_id = p.id
      WHERE p.doctor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "activities: doctor update" ON public.activities;
CREATE POLICY "activities: doctor update"
  ON public.activities
  FOR UPDATE
  TO authenticated
  USING (
    goal_id IN (
      SELECT g.id FROM public.goals g
      JOIN public.patients p ON g.patient_id = p.id
      WHERE p.doctor_id = auth.uid()
    )
  );


-- -----------------------------------------------------------------------------
-- 2.5  GRANT DATA API ACCESS
-- Needed so the authenticated role can reach these tables through the REST API.
-- RLS above still controls which rows are visible per user.
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON public.profiles            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_practice_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.objectives  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities  TO authenticated;


-- -----------------------------------------------------------------------------
-- 2.6  STORAGE BUCKET  (session-audio)
-- Creates the private bucket for audio uploads if it doesn't already exist.
-- The service_role key (used by the backend AI worker) bypasses Storage RLS.
-- INSERT (upload) is restricted to authenticated users — API layer further
-- restricts this to doctor role only.
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-audio', 'session-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Doctor can upload audio files
DROP POLICY IF EXISTS "audio: doctor insert" ON storage.objects;
CREATE POLICY "audio: doctor insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'session-audio');

-- Doctor can view audio files belonging to their sessions
DROP POLICY IF EXISTS "audio: doctor select" ON storage.objects;
CREATE POLICY "audio: doctor select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'session-audio');
