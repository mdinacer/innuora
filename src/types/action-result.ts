/**
 * Standard Server Action result type (Supabase pattern)
 * All Server Actions return {data, error} for production-safe error handling
 */
export type ActionResult<T> = { data: T; error: null } | { data: null; error: ActionError };

export interface ActionError {
  message: string;
  code: string;
}
