import { AzureOpenAI } from "openai";
import { config } from "../config/env";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs/promises";
import fsSync from "fs";
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
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// ---------------------------------------------------------------------------
// Azure OpenAI client factory (lazy — only created when pipeline runs)
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
// Transcription — HuggingFace Whisper Large v3 via local Python script
// ---------------------------------------------------------------------------

export async function transcribeAudio(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (!config.AZURE_SPEECH_KEY || !config.AZURE_SPEECH_REGION) {
    throw new Error("Azure Speech is not configured in .env");
  }

  const ext = mimetype.includes("webm") ? ".webm" : mimetype.includes("wav") ? ".wav" : ".mp3";
  const tempInputPath = path.join(os.tmpdir(), `audio-in-${Date.now()}${ext}`);
  const tempWavPath = path.join(os.tmpdir(), `audio-out-${Date.now()}.wav`);
  
  await fs.writeFile(tempInputPath, buffer);

  try {
    // 1. Convert WebM/audio to WAV using fluent-ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .toFormat('wav')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
        .save(tempWavPath);
    });

    // 2. Transcribe via Azure Speech SDK
    const speechConfig = sdk.SpeechConfig.fromSubscription(config.AZURE_SPEECH_KEY, config.AZURE_SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = "en-US";
    
    // fromWavFileInput accepts a Node.js Buffer
    const wavBuffer = await fs.readFile(tempWavPath);
    const audioConfig = sdk.AudioConfig.fromWavFileInput(wavBuffer);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    let fullText = "";

    await new Promise<void>((resolve, reject) => {
      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          fullText += e.result.text + " ";
        }
      };

      recognizer.canceled = (s, e) => {
        if (e.reason === sdk.CancellationReason.Error) {
          reject(new Error(`Azure Speech error: ${e.errorDetails}`));
        }
      };

      recognizer.sessionStopped = (s, e) => {
        recognizer.stopContinuousRecognitionAsync(() => {
          resolve();
        });
      };

      recognizer.startContinuousRecognitionAsync();
    });

    return fullText.trim();
  } finally {
    // Clean up temp files
    await fs.unlink(tempInputPath).catch(() => {});
    await fs.unlink(tempWavPath).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// SOAP Note generation — Azure OpenAI
// ---------------------------------------------------------------------------

const SOAP_SYSTEM_PROMPT = `You are a clinical assistant for speech-language pathology (SLP) sessions.
Your task is to generate a structured SOAP note from a session transcript.

Return ONLY valid JSON in this exact format:
{
  "subjective": "Patient's and caregiver's reported observations...",
  "objective": "Measurable, observable clinical data and performance metrics...",
  "assessment": "Clinical interpretation of patient progress and analysis...",
  "plan": "Goals and plans for upcoming sessions..."
}

Guidelines:
- Subjective: Use patient/caregiver quotes and self-reported observations
- Objective: Include accuracy percentages, trial counts, specific behaviors observed
- Assessment: Clinical interpretation, progress toward goals, patterns noted
- Plan: Specific next steps, targets for next session, home program updates
- Be specific and clinical while basing everything strictly on the transcript provided`;

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
    subjective: parsed.subjective ?? "",
    objective: parsed.objective ?? "",
    assessment: parsed.assessment ?? "",
    plan: parsed.plan ?? "",
  };
}

// ---------------------------------------------------------------------------
// Parent summary — Azure OpenAI
// ---------------------------------------------------------------------------

const SUMMARY_SYSTEM_PROMPT = `You are a compassionate communication assistant for speech-language pathology.
Write a short, warm, non-clinical summary of a therapy session for a parent or caregiver.

Guidelines:
- 3 to 5 sentences maximum
- Use simple, everyday language — no clinical jargon
- Be positive and encouraging while being honest
- Focus on what the child practiced and any progress made
- Mention one concrete home activity the family can do`;

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
