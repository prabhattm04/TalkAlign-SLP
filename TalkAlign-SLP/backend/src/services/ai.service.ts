import { AzureOpenAI } from "openai";
import { config } from "../config/env";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs/promises";

import path from "path";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PatientInfo {
  name: string;
  condition: string;
  age: number;
}

export interface SOAPNote {
  title?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// ---------------------------------------------------------------------------
// Azure OpenAI client factory (lazy â€” only created when pipeline runs)
// ---------------------------------------------------------------------------

function getAzureClient(): AzureOpenAI {
  if (!config.AZURE_OPENAI_ENDPOINT || !config.AZURE_OPENAI_KEY) {
    throw new Error(
      "Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY in your .env file."
    );
  }
  return new AzureOpenAI({
    endpoint: config.AZURE_OPENAI_ENDPOINT,
    apiKey: config.AZURE_OPENAI_KEY,
    apiVersion: config.AZURE_OPENAI_API_VERSION,
  });
}

// ---------------------------------------------------------------------------
// Transcription â€” HuggingFace Whisper Large v3 via local Python script
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Transcription — Sarvam AI Saaras v3 (Hinglish / Indian language support)
//
// Strategy:
//   ≤ 30 s of audio → REST API  (synchronous, instant response)
//   > 30 s of audio → Batch API (async: init → upload → start → poll → download)
//
// Mode "codemix" is the best fit for therapy sessions:
//   English clinical terms stay in English; Hindi words stay in Devanagari.
//   Example: "मेरा phone number है" → exactly as spoken, no forced translation.
//
// language_code "unknown" enables Sarvam's automatic language detection,
// so the model identifies the dominant language without prior knowledge.
// ---------------------------------------------------------------------------

const SARVAM_API_BASE = "https://api.sarvam.ai";
const SARVAM_REST_MAX_SECONDS = 30; // REST endpoint limit per Sarvam docs

// How long a WAV file is in seconds (needed to pick REST vs Batch)
function wavDurationSeconds(buffer: Buffer): number {
  // WAV header: bytes 24–27 = sample rate (uint32 LE), bytes 28–31 = byte rate
  // bytes 4–7 = chunk size = fileSize - 8
  // data chunk starts at byte 44 for standard PCM WAV
  const dataSize = buffer.length - 44;
  const byteRate = buffer.readUInt32LE(28);
  if (byteRate === 0) return Infinity; // guard against malformed headers
  return dataSize / byteRate;
}

export async function transcribeAudio(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (!config.SARVAM_API_KEY) {
    throw new Error("SARVAM_API_KEY is not set in .env");
  }

  const ext = mimetype.includes("webm") ? ".webm" : mimetype.includes("wav") ? ".wav" : ".mp3";
  const tempInputPath = path.join(os.tmpdir(), `audio-in-${Date.now()}${ext}`);
  const tempWavPath = path.join(os.tmpdir(), `audio-out-${Date.now()}.wav`);

  await fs.writeFile(tempInputPath, buffer);

  try {
    // 1. Convert input audio to 16 kHz mono WAV (required by Sarvam for best accuracy)
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .toFormat("wav")
        .audioChannels(1)
        .audioFrequency(16000)
        .on("end", () => resolve())
        .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .save(tempWavPath);
    });

    const wavBuffer = await fs.readFile(tempWavPath);
    const duration = wavDurationSeconds(wavBuffer);
    console.log(`[Transcribe] Audio duration: ${duration.toFixed(1)}s`);
    
    // Debug: Log the API key prefix to ensure it's loaded properly
    const keyPrefix = config.SARVAM_API_KEY ? `${config.SARVAM_API_KEY.substring(0, 5)}...` : "UNDEFINED";
    console.log(`[Transcribe] Using Sarvam API Key: ${keyPrefix}`);

    // 2. Route to REST API (short) or Batch API (long)
    if (duration <= SARVAM_REST_MAX_SECONDS) {
      console.log("[Transcribe] Using Sarvam REST API (≤30s audio)");
      return await transcribeViaSarvamRest(wavBuffer, config.SARVAM_API_KEY);
    } else {
      console.log("[Transcribe] Using Sarvam Batch API (>30s audio)");
      return await transcribeViaSarvamBatch(wavBuffer, config.SARVAM_API_KEY);
    }
  } finally {
    await fs.unlink(tempInputPath).catch(() => {});
    await fs.unlink(tempWavPath).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// REST API path — synchronous, for audio ≤ 30 seconds
// POST https://api.sarvam.ai/speech-to-text
// ---------------------------------------------------------------------------
async function transcribeViaSarvamRest(wavBuffer: Buffer, apiKey: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([wavBuffer], { type: "audio/wav" }), "audio.wav");
  form.append("model", "saaras:v3");
  form.append("mode", "codemix");          // Hinglish: English in Latin, Hindi in Devanagari
  form.append("language_code", "unknown"); // auto-detect dominant language
  form.append("with_timestamps", "false");
  form.append("with_diarization", "false");

  const res = await fetch(`${SARVAM_API_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": apiKey },
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Sarvam REST API error ${res.status}: ${errBody}`);
  }

  const json = await res.json() as { transcript?: string; language_code?: string };
  console.log(`[Transcribe] Detected language: ${json.language_code ?? "unknown"}`);
  return (json.transcript ?? "").trim();
}

// ---------------------------------------------------------------------------
// Batch API path — async polling, for audio > 30 seconds (up to 1 hour)
//
// Flow:
//   1. POST /speech-to-text/job/v1         → get job_id
//   2. POST /speech-to-text/job/v1/{id}/files → upload the WAV
//   3. POST /speech-to-text/job/v1/{id}/start → kick off processing
//   4. GET  /speech-to-text/job/v1/{id}    → poll until COMPLETED | FAILED
//   5. POST /speech-to-text/job/v1/{id}/download → get transcripts
// ---------------------------------------------------------------------------
async function transcribeViaSarvamBatch(wavBuffer: Buffer, apiKey: string): Promise<string> {
  const headers = { "api-subscription-key": apiKey, "Content-Type": "application/json" };

  // Step 1: Initiate job
  const initRes = await fetch(`${SARVAM_API_BASE}/speech-to-text/job/v1`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "saaras:v3",
      mode: "codemix",           // Hinglish-friendly output
      language_code: "unknown",  // let Sarvam auto-detect
      with_diarization: true,    // speaker labels useful for SLP sessions
      num_speakers: 3,           // therapist + patient + caregiver
    }),
  });

  if (!initRes.ok) {
    const errBody = await initRes.text();
    throw new Error(`Sarvam Batch init failed ${initRes.status}: ${errBody}`);
  }

  const { job_id } = await initRes.json() as { job_id: string };
  console.log(`[Transcribe] Sarvam batch job created: ${job_id}`);

  // Step 2: Upload audio file
  const uploadForm = new FormData();
  uploadForm.append("file", new Blob([wavBuffer], { type: "audio/wav" }), "session.wav");

  const uploadRes = await fetch(`${SARVAM_API_BASE}/speech-to-text/job/v1/${job_id}/files`, {
    method: "POST",
    headers: { "api-subscription-key": apiKey },
    body: uploadForm,
  });

  if (!uploadRes.ok) {
    const errBody = await uploadRes.text();
    throw new Error(`Sarvam Batch upload failed ${uploadRes.status}: ${errBody}`);
  }
  console.log(`[Transcribe] Audio uploaded to job ${job_id}`);

  // Step 3: Start the job
  const startRes = await fetch(`${SARVAM_API_BASE}/speech-to-text/job/v1/${job_id}/start`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!startRes.ok) {
    const errBody = await startRes.text();
    throw new Error(`Sarvam Batch start failed ${startRes.status}: ${errBody}`);
  }
  console.log(`[Transcribe] Job ${job_id} started, polling for completion...`);

  // Step 4: Poll for completion (max 10 minutes, every 5 seconds)
  const POLL_INTERVAL_MS = 5_000;
  const POLL_TIMEOUT_MS = 10 * 60 * 1_000;
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const statusRes = await fetch(`${SARVAM_API_BASE}/speech-to-text/job/v1/${job_id}`, {
      headers: { "api-subscription-key": apiKey },
    });

    if (!statusRes.ok) {
      console.warn(`[Transcribe] Status poll returned ${statusRes.status}, retrying...`);
      continue;
    }

    const status = await statusRes.json() as { job_state: string; error_message?: string };
    console.log(`[Transcribe] Job ${job_id} state: ${status.job_state}`);

    if (status.job_state === "COMPLETED") break;
    if (status.job_state === "FAILED") {
      throw new Error(`Sarvam batch job failed: ${status.error_message ?? "unknown error"}`);
    }
  }

  // Step 5: Download and merge transcripts
  const downloadRes = await fetch(`${SARVAM_API_BASE}/speech-to-text/job/v1/${job_id}/download`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!downloadRes.ok) {
    const errBody = await downloadRes.text();
    throw new Error(`Sarvam Batch download failed ${downloadRes.status}: ${errBody}`);
  }

  // Response is an array of per-file results
  type FileResult = { transcript?: string; diarized_transcript?: { entries: { transcript: string; speaker_id: string }[] }; language_code?: string };
  const results = await downloadRes.json() as FileResult[];

  if (!results || results.length === 0) {
    throw new Error("Sarvam Batch returned no results");
  }

  const result = results[0];
  console.log(`[Transcribe] Detected language: ${result.language_code ?? "unknown"}`);

  // Prefer diarized format for SLP sessions (shows who said what)
  if (result.diarized_transcript?.entries?.length) {
    return result.diarized_transcript.entries
      .map((e) => `[Speaker ${e.speaker_id}]: ${e.transcript}`)
      .join("\n")
      .trim();
  }

  return (result.transcript ?? "").trim();
}

// ---------------------------------------------------------------------------
// SOAP Note generation â€” Azure OpenAI
// ---------------------------------------------------------------------------

const SOAP_SYSTEM_PROMPT = `You are an expert, compassionate clinical assistant for speech-language pathology (SLP) sessions.
Your task is to generate a structured, human-centric SOAP note from a session transcript.
Keep in mind the patient's age, name, and specific condition to understand their problem in a better and more empathetic way. Write the notes similarly to how a real speech therapist would.

Return ONLY valid JSON in this exact format:
{
  "title": "A short, descriptive title for this session (e.g. 'Articulation Therapy - Progress Check')",
  "subjective": "• Patient/caregiver reported observations...\\n• Emotional state...",
  "objective": "• Measurable data...\\n• Performance metrics...",
  "assessment": "• Clinical interpretation...\\n• Progress analysis...",
  "plan": "• Next steps...\\n• Targets..."
}

Guidelines:
- Write the content of EACH section using clear, appropriate bullet points (pointers) with adequate clinical details. Use \\n to separate bullet points in the JSON string.
- Contextualize the notes: Use the patient's name and consider their age when interpreting behaviors, engagement, and speech patterns.
- Subjective: Use patient/caregiver quotes, self-reported observations, and behavioral state.
- Objective: Include accuracy percentages, trial counts, and specific behaviors observed.
- Assessment: Clinical interpretation, progress toward goals, and patterns noted, keeping age-appropriate milestones in mind.
- Plan: Specific next steps, targets for next session, and home program updates.
- Base everything strictly on the transcript provided while maintaining a warm, professional, yet human clinical tone.`;

export async function generateSOAP(
  transcript: string,
  patient: PatientInfo
): Promise<SOAPNote> {
  const client = getAzureClient();

  const completion = await client.chat.completions.create({
    model: config.AZURE_OPENAI_DEPLOYMENT,
    messages: [
      { role: "system", content: SOAP_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Patient: ${patient.name}, Age: ${patient.age}, Condition: ${patient.condition}

Session Transcript:
${transcript}

Generate the SOAP note JSON.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1500,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  let parsed: Partial<SOAPNote>;
  try {
    parsed = JSON.parse(raw) as Partial<SOAPNote>;
  } catch {
    throw new Error("Azure OpenAI returned invalid JSON for the SOAP note");
  }

  return {
    title: parsed.title ?? "Therapy Session",
    subjective: parsed.subjective ?? "",
    objective: parsed.objective ?? "",
    assessment: parsed.assessment ?? "",
    plan: parsed.plan ?? "",
  };
}

// ---------------------------------------------------------------------------
// Parent summary â€” Azure OpenAI
// ---------------------------------------------------------------------------

const SUMMARY_SYSTEM_PROMPT = `You are a compassionate communication assistant for speech-language pathology.
Write a warm, non-clinical summary of a therapy session for the parent or caregiver.

Guidelines:
- Explicitly use the patient's name in the summary to make it personal.
- Provide a clear and accurate summary using bullet points (pointers) wherever needed to make it easy for parents to read.
- Keep it concise (around 3 to 6 key points/sentences maximum).
- Use simple, everyday language — absolutely no clinical jargon.
- Be positive and encouraging while being honest about what happened in the session.
- Focus on what the child practiced, their engagement, and any progress made.
- Always include one concrete, easy-to-do home activity the family can practice.`;

export async function generateParentSummary(
  soap: SOAPNote,
  patientName: string
): Promise<string> {
  const client = getAzureClient();

  const completion = await client.chat.completions.create({
    model: config.AZURE_OPENAI_DEPLOYMENT,
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Patient: ${patientName}

Session Notes:
Subjective: ${soap.subjective}
Objective: ${soap.objective}
Assessment: ${soap.assessment}
Plan: ${soap.plan}

Write the parent summary.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

// ---------------------------------------------------------------------------
// Auto-suggest Goals â€” Azure OpenAI
// ---------------------------------------------------------------------------

const GOAL_SUGGEST_SYSTEM_PROMPT = `You are an expert speech-language pathologist (SLP).
Given the patient's past session SOAP notes and transcript summaries, suggest 3-5 therapeutic goals or tasks.
The output MUST be a JSON array of objects with the following schema:
[
  {
    "title": "Clear, actionable task/goal title",
    "type": "short_term" | "long_term",
    "baseline": "Optional baseline performance if known",
    "target": "Optional target performance/accuracy"
  }
]
Do not include any extra text. Return ONLY the valid JSON array.`;

export async function suggestGoals(
  patient: PatientInfo,
  sessionsContext: string
): Promise<any[]> {
  const client = getAzureClient();

  const completion = await client.chat.completions.create({
    model: config.AZURE_OPENAI_DEPLOYMENT,
    messages: [
      { role: "system", content: GOAL_SUGGEST_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Patient: ${patient.name}, Age: ${patient.age}, Condition: ${patient.condition}

Past Sessions Context:
${sessionsContext}

Generate suggested goals.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 1500,
  });

  const raw = completion.choices[0]?.message?.content ?? "[]";

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("Azure OpenAI returned invalid JSON for the goals suggestion");
  }
}

