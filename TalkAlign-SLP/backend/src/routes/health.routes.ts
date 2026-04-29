import { Router, Request, Response } from "express";
import { config } from "../config/env";

const router = Router();

// ---------------------------------------------------------------------------
// GET /health
// Quick liveness check — confirms the Express server is running.
// ---------------------------------------------------------------------------
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

// ---------------------------------------------------------------------------
// GET /db-test
// Connectivity check — confirms the Supabase connection is live.
// Hits the PostgREST /rest/v1/ root endpoint which is always present
// without depending on any application table.
// ---------------------------------------------------------------------------
router.get("/db-test", async (_req: Request, res: Response) => {
  try {
    // Use a raw SQL ping — avoids depending on any application table.
    // supabase-js exposes arbitrary SQL through .rpc() when you create
    // a helper function, but the simplest approach is the REST /rest/v1/
    // health endpoint which is always available on every Supabase project.
    const response = await fetch(`${config.SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: config.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${config.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(503).json({
        success: false,
        error: {
          message: `Database connection failed: HTTP ${response.status}`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: "connected",
        message: "Supabase connection is healthy",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({
      success: false,
      error: { message },
    });
  }
});

export default router;
