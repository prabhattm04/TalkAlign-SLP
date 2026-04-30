/**
 * Feature 7 — Audio Upload & AI Pipeline
 *
 * Required Supabase migrations before use:
 *   ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'processing';
 *   ALTER TYPE session_status ADD VALUE IF NOT EXISTS 'draft';
 *   ALTER TABLE sessions ADD COLUMN IF NOT EXISTS transcript TEXT;
 *   ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_parent_summary TEXT;
 *   ALTER TABLE sessions ADD COLUMN IF NOT EXISTS audio_file_path TEXT;
 *
 *   Storage: create bucket "session-audio" (private) in Supabase Dashboard.
 */

import { Request, Response } from "express";
import { sendSuccess, sendError } from "../lib/apiResponse";
import { createAdminClient } from "../config/supabase";
import { uploadAudioToStorage } from "../services/storage.service";
import {
  transcribeAudio,
  generateSOAP,
  generateParentSummary,
  PatientInfo,
} from "../services/ai.service";

// ---------------------------------------------------------------------------
// Route handler: POST /api/v1/sessions/:id/audio
// Accepts multipart/form-data with a single "audio" field.
// Responds immediately with { status: "processing" } then runs the AI
// pipeline asynchronously.
// ---------------------------------------------------------------------------

export async function uploadAudioHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { id: sessionId } = req.params;
  const file = req.file;

  if (!file) {
    res.status(400).json(sendError("No audio file provided"));
    return;
  }

  // Confirm the session exists and belongs to this doctor (RLS enforces ownership)
  const { data: session, error: sessionError } = await req.supabase!
    .from("sessions")
    .select("id, patient_id, patients(name, condition, age)")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    res.status(404).json(sendError("Session not found or access denied"));
    return;
  }

  // Mark processing status using admin client so the background worker can
  // update the row without being blocked by RLS.
  const admin = createAdminClient();
  await admin.from("sessions").update({ status: "processing" }).eq("id", sessionId);

  // Respond before the pipeline starts — this is the fire-and-forget pattern.
  res.status(200).json(sendSuccess({ status: "processing" }));

  // Fire and forget — errors are caught and logged without crashing the server.
  // Supabase returns the related record as an object when joining a FK (many-to-one).
  const patient = (session.patients as unknown) as PatientInfo | null;
  runAIPipeline(sessionId, file.buffer, file.mimetype, patient).catch(
    async (err: Error) => {
      console.error(`[AI Pipeline] Session ${sessionId} failed:`, err.message);
      try {
        await admin.from("sessions").update({ status: "error" }).eq("id", sessionId);
      } catch {
        // swallow secondary error so nothing propagates
      }
    }
  );
}

// ---------------------------------------------------------------------------
// AI Pipeline (runs asynchronously after the HTTP response is sent)
// ---------------------------------------------------------------------------

async function runAIPipeline(
  sessionId: string,
  buffer: Buffer,
  mimetype: string,
  patient: PatientInfo | null
): Promise<void> {
  console.log(`[AI Pipeline] Starting pipeline for session ${sessionId}`);
  const admin = createAdminClient();
  const patientInfo: PatientInfo = patient ?? {
    name: "Patient",
    condition: "speech therapy",
    age: 0,
  };

  try {
    // Step 1 — Upload audio to Supabase Storage
    console.log(`[AI Pipeline] Step 1: Uploading audio to Supabase Storage...`);
    const audioPath = await uploadAudioToStorage(sessionId, buffer, mimetype);
    console.log(`[AI Pipeline] Step 1 Complete: Audio uploaded to ${audioPath}`);

    // Step 2 — Transcribe via HuggingFace Whisper Large v3
    console.log(`[AI Pipeline] Step 2: Transcribing audio via Python local Whisper... (this may take several minutes on CPU)`);
    const transcript = await transcribeAudio(buffer, mimetype);
    console.log(`[AI Pipeline] Step 2 Complete: Transcription finished. Length: ${transcript.length} characters`);

    // Step 3 — Generate SOAP note via Azure OpenAI
    console.log(`[AI Pipeline] Step 3: Generating SOAP note via Azure OpenAI...`);
    const soap = await generateSOAP(transcript, patientInfo);
    console.log(`[AI Pipeline] Step 3 Complete: SOAP note generated.`);

    // Step 4 — Generate caregiver summary via Azure OpenAI
    console.log(`[AI Pipeline] Step 4: Generating Parent Summary...`);
    const parentSummary = await generateParentSummary(soap, patientInfo.name);
    console.log(`[AI Pipeline] Step 4 Complete: Parent summary generated.`);

    // Step 5 — Persist all AI outputs, transition session to draft
    console.log(`[AI Pipeline] Step 5: Saving results and updating status to draft...`);
    const { error } = await admin
      .from("sessions")
      .update({
        transcript,
        soap_subjective: soap.subjective,
        soap_objective: soap.objective,
        soap_assessment: soap.assessment,
        soap_plan: soap.plan,
        ai_parent_summary: parentSummary,
        audio_file_path: audioPath,
        status: "draft",
      })
      .eq("id", sessionId);

    if (error) throw new Error(`Failed to save AI results: ${error.message}`);
    console.log(`[AI Pipeline] Pipeline completed successfully for session ${sessionId}`);
  } catch (error) {
    console.error(`[AI Pipeline] Pipeline failed at some step:`, error);
    throw error;
  }
}
