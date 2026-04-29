// ---------------------------------------------------------------------------
// Standard API response helpers
//
// Success:  { success: true,  data: T }
// Error:    { success: false, error: { message: string } }
//
// Use these in every route handler and middleware — never construct the
// response shape inline — so the format stays consistent across the API.
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Wrap any payload in a success envelope.
 * @example res.json(sendSuccess({ id: 1 }))
 */
export function sendSuccess<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

/**
 * Wrap an error message in the standard error envelope.
 * @example res.status(401).json(sendError("Not authenticated"))
 */
export function sendError(message: string): ApiError {
  return { success: false, error: { message } };
}
