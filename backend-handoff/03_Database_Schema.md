# 03 — Database Schema

These are the tables required in the Supabase PostgreSQL database. 

## Table: profiles
Extends the Supabase `auth.users` table.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, references auth.users(id) |
| name | text | Full name |
| email | text | Unique |
| role | text | Enum: `doctor` or `parent` |
| created_at | timestamptz | default now() |

## Table: patients
Stores the speech therapy patients.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| doctor_id | uuid | FK to profiles(id) (Role: doctor) |
| caregiver_id | uuid | FK to profiles(id) (Role: parent, nullable) |
| name | text | Patient name |
| age | int | |
| gender | text | |
| condition | text | Primary diagnosis |
| notes | text | Initial intake notes |
| status | text | Enum: `active`, `inactive`, `discharged` |
| tags | text[] | Array of interests (e.g. ["Dinosaurs", "Space"]) |
| caregiver_phone | text | Nullable |
| created_at | timestamptz | |

## Table: sessions
Therapy sessions containing notes and AI summaries.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| patient_id | uuid | FK to patients(id) |
| therapist_id | uuid | FK to profiles(id) |
| date | timestamptz | Date of session |
| duration | int | Minutes (nullable) |
| status | text | Enum: `scheduled`, `in_progress`, `completed` |
| summary | text | Brief manual summary (nullable) |
| soap_subjective | text | Nullable |
| soap_objective | text | Nullable |
| soap_assessment | text | Nullable |
| soap_plan | text | Nullable |
| ai_parent_summary | text | Nullable |
| audio_file_path | text | Supabase Storage path to audio (nullable) |
| transcript | jsonb | Array of {speaker, text, time} (nullable) |
| created_at | timestamptz | |

## Table: home_practice_tasks
Tasks assigned to a session for a caregiver to complete.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| session_id | uuid | FK to sessions(id) |
| title | text | |
| completed | boolean | Default false |
| completed_at | timestamptz | Nullable |

## Table: goals
Long-term therapy goals.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| patient_id | uuid | FK to patients(id) |
| title | text | |
| type | text | Enum: `long_term`, `short_term` |
| status | text | Enum: `not_started`, `in_progress`, `achieved` |
| baseline | text | |
| target | text | |
| created_at | timestamptz | |

## Table: objectives
Short-term objectives mapped to a goal.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| goal_id | uuid | FK to goals(id) |
| text | text | |
| status | text | Enum: `not_started`, `in_progress`, `achieved` |

## Table: activities
Therapy exercises linked to a goal.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| goal_id | uuid | FK to goals(id) |
| title | text | |
| difficulty | text | Enum: `Easy`, `Medium`, `Hard` |
| tags | text[] | Array of strings |
