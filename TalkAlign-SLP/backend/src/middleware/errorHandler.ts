import { Request, Response, NextFunction } from "express";
import multer from "multer";
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
  // Multer errors (file too large, wrong type) should be 400, not 500
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Audio file exceeds the 25 MB limit"
        : err.message;
    res.status(400).json(sendError(message));
    return;
  }

  console.error("[ErrorHandler]", err.message, "\n", err.stack);

  res
    .status(500)
    .json(sendError(err.message ?? "Internal server error"));
}
