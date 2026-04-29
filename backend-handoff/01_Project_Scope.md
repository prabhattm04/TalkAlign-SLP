# 01 — Project Scope & Core Workflows

## What Is TalkAlign?
TalkAlign is an AI-powered Speech-Language Pathology (SLP) application. It removes the documentation burden from SLPs by recording therapy sessions, transcribing the audio, and using AI to automatically generate structured clinical SOAP notes and a friendly summary for caregivers.

## Supported Roles
There are exactly **two** roles in the system. 
*(Note: Supervisor role was removed from the scope).*

1. **Doctor / SLP (`doctor`)**
   - Accesses `/dashboard`
   - Manages their assigned patients
   - Records sessions and finalizes SOAP notes
   - Manages therapy goals and home practice tasks

2. **Parent / Caregiver (`parent`)**
   - Accesses `/portal`
   - Views session summaries (not the raw clinical SOAP notes)
   - Views and completes assigned home practice tasks
   - Tracks child's therapy goals

## The Core Application Workflow

1. **Start Session:** The SLP selects a patient and clicks "Start Session" in their dashboard. The browser begins recording audio.
2. **Stop Recording & Process:** The SLP stops the recording. The audio file is uploaded to the backend.
3. **AI Pipeline (Async):**
   - The backend stores the audio in Supabase Storage.
   - The audio is sent to OpenAI Whisper for transcription.
   - The transcript is sent to OpenAI GPT to generate a clinical SOAP note.
   - The SOAP note is used to generate a friendly "Parent Summary".
4. **Draft Review:** The SLP reviews the generated SOAP note, edits it if needed, adds "Home Practice" tasks, and clicks "Finalize".
5. **Caregiver View:** The caregiver logs into the portal, sees the friendly summary, and can check off home practice tasks.

## Terminology
* **SOAP Note:** Structured clinical note consisting of Subjective, Objective, Assessment, and Plan.
* **Home Practice:** Tasks assigned by the SLP for the patient to do at home.
* **Goal:** A long-term therapy target (e.g., "Master /r/ sound").
* **Objective:** Short-term measurable targets under a Goal.
* **Activity:** Specific exercises mapped to a Goal.
