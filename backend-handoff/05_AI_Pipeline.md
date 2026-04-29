# 05 — AI Pipeline Specification

This document details the core AI workflow that must be orchestrated by the Express backend.

## The Pipeline Flow

When the frontend calls `POST /api/v1/sessions/:id/audio` with an audio blob:

1. **Storage:** Express backend receives the `audio` file via `multer`, uploads it directly to the Supabase Storage bucket (`session-audio`).
2. **Transcription:** Express backend sends the file stream to OpenAI Whisper API (`whisper-1`).
3. **SOAP Generation:** The resulting transcript is passed to OpenAI GPT (`gpt-4o`) using the SOAP System Prompt.
4. **Summary Generation:** The generated SOAP note is passed to OpenAI GPT using the Parent Summary Prompt.
5. **Database Update:** The session row in Supabase is updated with `transcript`, `soap_subjective`, `soap_objective`, `soap_assessment`, `soap_plan`, and `ai_parent_summary`. Status is changed to `draft`.

## 1. SOAP Note Prompt

When calling the OpenAI Chat Completions API for the SOAP note, use this prompt structure:

**System Prompt:**
```text
You are an expert Speech-Language Pathologist (SLP) assistant.
Your job is to generate accurate, professional SOAP notes from session transcripts.
SOAP notes must follow clinical standards used in SLP practice.
Always be specific and objective. Use clinical terminology appropriately.
Format each section as a single coherent paragraph.
```

**User Prompt:**
```text
Generate SOAP notes for the following therapy session.

PATIENT INFORMATION:
- Name: {patient_name}
- Age: {patient_age} years
- Primary Condition: {patient_condition}
- Current Goals: {patient_goals_list}

SESSION TRANSCRIPT:
{transcript_text_with_timestamps}

Please provide a structured SOAP note with:
- S (Subjective): Patient's/caregiver's report, patient's mood, behavior, self-report
- O (Objective): Measurable, observable clinical data, accuracy percentages, task performance
- A (Assessment): Clinical interpretation of progress, comparison to baselines, prognosis
- P (Plan): Goals for next session, home program, timeline for reassessment

Return the response strictly as a JSON object with keys: "subjective", "objective", "assessment", "plan"
```
*(Ensure `response_format: { type: "json_object" }` is passed to the OpenAI API).*

## 2. Parent Summary Prompt

After receiving the JSON SOAP note, make a second call to generate the parent summary:

**System / User Prompt:**
```text
You are a caring, friendly assistant helping parents understand their child's speech therapy progress.

Here are the clinical notes from {patient_name}'s therapy session:

Subjective: {soap.subjective}
Objective: {soap.objective}
Assessment: {soap.assessment}
Plan: {soap.plan}

Please write a short, warm, encouraging summary for {patient_name}'s family.
Guidelines:
- Write in a friendly, non-clinical tone
- Celebrate wins and progress, no matter how small
- Briefly explain what was practiced
- Mention what to look forward to
- Keep it to 2-3 sentences
- Avoid medical jargon
- Use the child's first name
```

## Polling vs WebSockets
To keep the backend simple and adhere to the current frontend implementation, **do not implement WebSockets**. 

The Express handler for the audio upload should just trigger the async AI function in the background (or handle it synchronously if timeouts aren't an issue) and immediately return `{ "status": "processing" }`. 

The frontend will simply poll `GET /api/v1/sessions/:id` to check when the session status updates from `processing` to `draft`.
