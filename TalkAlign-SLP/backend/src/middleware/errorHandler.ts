import { Request, Response, NextFunction } from "express";
import { sendError } from "../lib/apiResponse";

// ---------------------------------------------------------------------------
// Global error handler
//
// Must be registered as the LAST middleware in index.ts.
// Express identifies it as an error handler by the 4-argument signature.
// ---------------------------------------------------------------------------
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error("[ErrorHandler]", err.message, "\n", err.stack);

  res
    .status(500)
    .json(sendError(err.message ?? "Internal server error"));
}
