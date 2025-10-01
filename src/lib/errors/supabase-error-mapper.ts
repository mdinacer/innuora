import type { AuthError } from "@supabase/supabase-js";

import { ERROR_CODES, ErrorCode } from "./error-codes";

/**
 * Maps Supabase auth errors to our internal error codes
 * Uses error.code for precise mapping (available in both dev and prod)
 */
export function mapSupabaseAuthError(error: AuthError): ErrorCode {
  // Use the specific error code property (available in production)
  const code = error.code;

  // If no code, fall back to generic error
  if (!code) {
    return ERROR_CODES.SERVER_ERROR;
  }

  // Map Supabase error codes to our error codes
  // Focus on email/password authentication flow
  switch (code) {
    // Sign-in errors
    case "invalid_credentials":
      return ERROR_CODES.AUTH_INVALID_CREDENTIALS;
    case "user_not_found":
      return ERROR_CODES.AUTH_USER_NOT_FOUND;

    // Sign-up errors
    case "email_exists":
    case "user_already_exists":
      return ERROR_CODES.AUTH_EMAIL_EXISTS;
    case "weak_password":
      return ERROR_CODES.AUTH_WEAK_PASSWORD;
    case "email_address_invalid":
      return ERROR_CODES.AUTH_EMAIL_ADDRESS_INVALID;
    case "validation_failed":
      return ERROR_CODES.AUTH_VALIDATION_FAILED;

    // Account status errors
    case "email_not_confirmed":
      return ERROR_CODES.AUTH_EMAIL_NOT_CONFIRMED;
    case "signup_disabled":
      return ERROR_CODES.AUTH_SIGNUP_DISABLED;
    case "user_banned":
      return ERROR_CODES.AUTH_USER_BANNED;

    // Rate limiting
    case "over_request_rate_limit":
      return ERROR_CODES.AUTH_OVER_REQUEST_RATE_LIMIT;
    case "over_email_send_rate_limit":
      return ERROR_CODES.AUTH_OVER_EMAIL_SEND_RATE_LIMIT;

    // Session/token errors
    case "bad_jwt":
    case "session_expired":
      return ERROR_CODES.AUTH_SESSION_EXPIRED;
    case "refresh_token_not_found":
      return ERROR_CODES.AUTH_REFRESH_TOKEN_NOT_FOUND;
    case "refresh_token_already_used":
      return ERROR_CODES.AUTH_REFRESH_TOKEN_ALREADY_USED;

    // Fallback for unmapped codes
    default:
      // Try message-based fallback for any edge cases
      const message = error.message?.toLowerCase() || "";
      if (message.includes("sign") || message.includes("login")) {
        return ERROR_CODES.AUTH_SIGNIN_FAILED;
      }
      if (message.includes("signup") || message.includes("register")) {
        return ERROR_CODES.AUTH_SIGNUP_FAILED;
      }
      return ERROR_CODES.SERVER_ERROR;
  }
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
