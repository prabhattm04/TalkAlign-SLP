import "dotenv/config";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema — all required variables at startup.
// The server process.exit(1)s immediately if any are missing or malformed.
// ---------------------------------------------------------------------------
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),

  FRONTEND_URL: z
    .string()
    .url({ message: "FRONTEND_URL must be a valid URL" })
    .default("http://localhost:5173"),

  SUPABASE_URL: z.string().url({ message: "SUPABASE_URL must be a valid URL" }),

  SUPABASE_ANON_KEY: z
    .string()
    .min(1, { message: "SUPABASE_ANON_KEY is required" }),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, { message: "SUPABASE_SERVICE_ROLE_KEY is required" }),

  OPENAI_API_KEY: z.string().optional(),

  // Azure OpenAI — required when the AI pipeline runs
  AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
  AZURE_OPENAI_KEY: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT: z.string().default("gpt-4o"),
  AZURE_OPENAI_API_VERSION: z.string().default("2024-05-01-preview"),

  // Azure Speech — required for Transcription
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Validate at module load — fail fast with a clear diagnostic
// ---------------------------------------------------------------------------
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n");
  parsed.error.issues.forEach((issue) => {
    console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Export fully-typed config object
// ---------------------------------------------------------------------------
export const config = parsed.data;

export type Config = typeof config;
