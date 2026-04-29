import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type RequestSource = "body" | "query" | "params";

// ---------------------------------------------------------------------------
// validate(schema, source?)
//
// Usage:
//   router.post("/patients", validate(createPatientSchema), controller)
//   router.get("/patients/:id", validate(patientParamsSchema, "params"), ctrl)
//
// On success  → req[source] is replaced with the parsed (& transformed) value.
// On failure  → 400 with field-level error details from Zod.
// ---------------------------------------------------------------------------
export function validate(schema: ZodSchema, source: RequestSource = "body") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const result = await schema.safeParseAsync(req[source]);

    if (!result.success) {
      const error = result.error as ZodError;
      res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          details: error.flatten().fieldErrors,
        },
      });
      return;
    }

    // Mutate req with the parsed value so controllers receive typed data
    // (e.g. strings transformed to numbers, optional defaults applied, etc.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[source] = result.data;
    next();
  };
}
