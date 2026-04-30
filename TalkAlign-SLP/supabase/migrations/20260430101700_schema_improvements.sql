-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PATIENTS TABLE IMPROVEMENTS
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS caregiver_name text,
  ADD COLUMN IF NOT EXISTS caregiver_email text,
  ADD COLUMN IF NOT EXISTS caregiver_phone text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS patient_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- Add constraints
ALTER TABLE public.patients ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.patients ALTER COLUMN doctor_id SET NOT NULL;

-- Make patient_id UNIQUE if constraint doesn't exist
DO $$ BEGIN
  ALTER TABLE public.patients ADD CONSTRAINT patients_patient_id_key UNIQUE (patient_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; WHEN others THEN NULL; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON public.patients(doctor_id);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS set_patients_updated_at ON public.patients;
CREATE TRIGGER set_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();


-- SESSIONS TABLE IMPROVEMENTS
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS start_time timestamptz,
  ADD COLUMN IF NOT EXISTS end_time timestamptz,
  ADD COLUMN IF NOT EXISTS miscellaneous_notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- Convert transcript to text
ALTER TABLE public.sessions ALTER COLUMN transcript TYPE text USING transcript::text;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON public.sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist_id ON public.sessions(therapist_id);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS set_sessions_updated_at ON public.sessions;
CREATE TRIGGER set_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();


-- HOME PRACTICE TASKS TABLE
-- Foreign key with ON DELETE CASCADE already exists from initial schema, 
-- but ensuring it by attempting a safe add if needed is risky without dropping.
-- We skip re-creating the FK because it's standardly defined in the initial migration.

-- Ensure all tables have created_at (already set in initial migrations).
