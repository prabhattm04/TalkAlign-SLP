import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "./env";

// ---------------------------------------------------------------------------
// Admin client singleton (service role — bypasses RLS)
//
// Security rules (from Supabase skill):
//  • NEVER expose the service role key to the frontend.
//  • Use ONLY for server-side tasks: AI pipeline, admin webhooks, profile
//    lookups that need to bypass RLS (e.g., during authentication).
// ---------------------------------------------------------------------------
const _adminClient: SupabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Returns the shared service-role Supabase client.
 * Use only in server-side middleware and the AI pipeline worker.
 */
export function createAdminClient(): SupabaseClient {
  return _adminClient;
}

// Keep a named export for direct imports in existing code
export const supabaseAdmin = _adminClient;

// ---------------------------------------------------------------------------
// User-scoped client factory (anon key + user JWT — respects RLS)
//
// Creates a per-request Supabase client that forwards the user's JWT so
// every Postgres RLS policy evaluates correctly for that user.
// ---------------------------------------------------------------------------

/**
 * Creates a Supabase client scoped to the given user JWT.
 * Pass the raw token extracted from `Authorization: Bearer <token>`.
 */
export function createUserClient(token: string): SupabaseClient {
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
