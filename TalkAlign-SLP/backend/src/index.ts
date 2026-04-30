import "dotenv/config"; // Must be first — loads .env before config validation
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import healthRouter from "./routes/health.routes";

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app: Application = express();

// ---------------------------------------------------------------------------
// Security & logging middleware (applied before routes)
// ---------------------------------------------------------------------------
app.use(helmet()); // Sets secure HTTP headers
app.use(morgan("dev")); // Request logging: METHOD /path STATUS ms

// ---------------------------------------------------------------------------
// Parsing middleware
// ---------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: config.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Root health check — unauthenticated, always available
// ---------------------------------------------------------------------------
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// ---------------------------------------------------------------------------
// Diagnostics routes (liveness + DB connectivity)
// ---------------------------------------------------------------------------
app.use("/", healthRouter);

// ---------------------------------------------------------------------------
// API routes — Feature routes will be mounted here:
//
import authRouter from "./routes/auth.routes";
app.use("/api/v1/auth", authRouter);

import patientsRouter from "./routes/patients.routes";
app.use("/api/v1/patients", patientsRouter);

import sessionsRouter from "./routes/sessions.routes";
app.use("/api/v1/sessions", sessionsRouter);

import goalsRouter from "./routes/goals.routes";
app.use("/api/v1/goals", goalsRouter);

import portalRouter from "./routes/portal.routes";
app.use("/api/v1/portal", portalRouter);
//
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: "Route not found" },
  });
});

// ---------------------------------------------------------------------------
// Global error handler — must be LAST
// ---------------------------------------------------------------------------
app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(config.PORT, () => {
  console.log(`\n✅ TalkAlign backend running`);
  console.log(`   Port:     ${config.PORT}`);
  console.log(`   CORS:     ${config.FRONTEND_URL}`);
  console.log(`   Health:   http://localhost:${config.PORT}/`);
  console.log(`   DB test:  http://localhost:${config.PORT}/db-test`);
  console.log(`   API base: http://localhost:${config.PORT}/api/v1\n`);
});

export default app;
