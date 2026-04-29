import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";
import { sendSuccess, sendError } from "../lib/apiResponse";

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body;

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (error) {
    res.status(400).json(sendError(error.message));
    return;
  }

  res.status(201).json(
    sendSuccess({
      user: data.user,
      accessToken: data.session?.access_token || null,
      refreshToken: data.session?.refresh_token || null,
    })
  );
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(401).json(sendError(error.message));
    return;
  }

  // Fetch the profile to get the authoritative role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, name, email, role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    res.status(401).json(sendError("User profile not found"));
    return;
  }

  res.status(200).json(
    sendSuccess({
      user: profile,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    })
  );
}

export async function logout(req: Request, res: Response): Promise<void> {
  // Use the admin client to sign out. If the user is authenticated (via auth middleware),
  // they provide a valid JWT. The admin client signOut requires the token if we want to
  // invalidate a specific token, but supabaseAdmin signOut might just clear the local session.
  // Actually, to sign out globally or locally, Supabase needs the session. 
  // We can just call admin signOut with the user's JWT.
  
  const token = req.headers.authorization?.split(" ")[1];
  
  if (token) {
    // Calling admin signOut with a specific token scope is complex,
    // let's just use the server-side signOut. If we had createUserClient(token), we'd use that.
    // In auth.ts: (req as any).supabase = createUserClient(token);
    const userClient = (req as any).supabase;
    if (userClient) {
      await userClient.auth.signOut();
    } else {
      await supabaseAdmin.auth.signOut();
    }
  }

  res.status(200).json(sendSuccess(null));
}
