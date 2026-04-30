import { createAdminClient } from "../config/supabase";

const BUCKET = "session-audio";

function mimetypeToExt(mimetype: string): string {
  if (mimetype.startsWith("audio/webm")) return "webm";
  if (mimetype.startsWith("audio/wav") || mimetype.startsWith("audio/wave") || mimetype.startsWith("audio/x-wav")) return "wav";
  if (mimetype.startsWith("audio/mpeg") || mimetype.startsWith("audio/mp3")) return "mp3";
  if (mimetype.startsWith("audio/mp4") || mimetype.startsWith("audio/x-m4a")) return "m4a";
  if (mimetype.startsWith("audio/ogg")) return "ogg";
  return "audio";
}

export async function uploadAudioToStorage(
  sessionId: string,
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  const ext = mimetypeToExt(mimetype);
  const path = `${sessionId}/${Date.now()}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimetype, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return path;
}
