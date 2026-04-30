ALTER TABLE public.patients
ADD COLUMN caregiver_name text,
ADD COLUMN caregiver_email text,
ADD COLUMN patient_id text UNIQUE;
