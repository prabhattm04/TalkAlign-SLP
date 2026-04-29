import type { User } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Shared profile shape — mirrors the public.profiles table.
// ---------------------------------------------------------------------------
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "parent";
  created_at: string;
}

// ---------------------------------------------------------------------------
// Extend Express Request so downstream route handlers are fully typed.
// ---------------------------------------------------------------------------
declare global {
  namespace Express {
    interface Request {
      /** Supabase User — set by the `authenticate` middleware after JWT validation. */
      user?: User;
      /** Row from public.profiles — set by `authenticate` alongside `user`. */
      profile?: UserProfile;
      /** Scoped Supabase Client — set by `authenticate`. */
      supabase?: import("@supabase/supabase-js").SupabaseClient;
    }
  }
}
