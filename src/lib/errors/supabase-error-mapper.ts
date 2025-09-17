import type { AuthError } from "@supabase/supabase-js";

import { ERROR_CODES, ErrorCode } from "./error-codes";

/**
 * Maps Supabase auth errors to our internal error codes
 * Only handles the most common auth errors we'll encounter
 */
export function mapSupabaseAuthError(error: AuthError): ErrorCode {
  // Supabase AuthError properties: message, status, statusCode, name
  const message = error.message.toLowerCase();

  // Map based on common error messages/patterns
  if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
    return ERROR_CODES.AUTH_SIGNIN_FAILED;
  }

  if (message.includes("user already registered") || message.includes("email already registered")) {
    return ERROR_CODES.AUTH_SIGNUP_FAILED;
  }

  if (message.includes("email address is invalid") || message.includes("invalid email")) {
    return ERROR_CODES.AUTH_EMAIL_INVALID;
  }

  if (message.includes("too many requests") || message.includes("rate limit")) {
    return ERROR_CODES.AUTH_RATE_LIMITED;
  }

  if (message.includes("email not confirmed") || message.includes("confirm your email")) {
    return ERROR_CODES.AUTH_ACCOUNT_NOT_CONFIRMED;
  }

  if (message.includes("jwt expired") || message.includes("session expired") || message.includes("refresh token")) {
    return ERROR_CODES.AUTH_SESSION_EXPIRED;
  }

  if (message.includes("weak password") || message.includes("password should be")) {
    return ERROR_CODES.AUTH_PASSWORD_REQUIREMENTS;
  }

  if (message.includes("signup disabled") || message.includes("user banned")) {
    return ERROR_CODES.AUTH_SIGNUP_FAILED;
  }

  // Default fallback
  return ERROR_CODES.SERVER_ERROR;
}

/**
 * Maps general errors to our error codes
 */
export function mapGeneralError(error: any): ErrorCode {
  if (error.name === "NetworkError" || error.message?.includes("fetch")) {
    return ERROR_CODES.NETWORK_ERROR;
  }

  return ERROR_CODES.UNKNOWN_ERROR;
}
