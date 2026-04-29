import { Request, Response, NextFunction } from "express";
import { supabaseAdmin, createUserClient } from "../config/supabase";
import { sendError } from "../lib/apiResponse";

// ---------------------------------------------------------------------------
// authenticate
//
// 1. Extracts `Authorization: Bearer <token>` from the request header.
// 2. Validates the JWT by calling supabaseAdmin.auth.getUser(token).
//    This is the server-side validation pattern — the token is verified
//    cryptographically without hitting the DB for every request.
// 3. Fetches the user's row from public.profiles using the admin client.
//    The role is stored in this table, NOT in user_metadata (which is
//    user-editable and unsafe for authorization decisions per Supabase docs).
// 4. Attaches req.user and req.profile so downstream handlers are typed.
// ---------------------------------------------------------------------------
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json(sendError("Missing or invalid Authorization header"));
    return;
  }

  const token = authHeader.split(" ")[1];

  // Validate JWT — supabaseAdmin.auth.getUser() verifies the signature and
  // expiry without creating a session.
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    res.status(401).json(sendError("Invalid or expired token"));
    return;
  }

  // Fetch the profile row to get the application-level role.
  // We use the admin client here so RLS doesn't block the read —
  // route-level data queries will use createUserClient(token) with RLS.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, name, email, role, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    res
      .status(401)
      .json(sendError("User profile not found — account may be incomplete"));
    return;
  }

  // Attach to req so downstream middleware and controllers can use them
  req.user = user;
  req.profile = profile;

  // Attach a scoped Supabase client so controllers can run RLS-enforced queries
  // without needing to re-extract the token.
  // Stored on req so it can be typed via the Express namespace extension.
  (req as Request & { supabase: ReturnType<typeof createUserClient> }).supabase =
    createUserClient(token);

  next();
}

// ---------------------------------------------------------------------------
// requireRole(...roles)
//
// Role guard factory — must be used AFTER `authenticate`.
//
// Usage:
//   router.post("/sessions", authenticate, requireRole("doctor"), createSession)
// ---------------------------------------------------------------------------
export function requireRole(...roles: Array<"doctor" | "parent">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.profile) {
      res.status(401).json(sendError("Not authenticated"));
      return;
    }

    if (!roles.includes(req.profile.role)) {
      res
        .status(403)
        .json(
          sendError(
            `Access denied — required role: ${roles.join(" or ")}`
          )
        );
      return;
    }

    next();
  };
}
