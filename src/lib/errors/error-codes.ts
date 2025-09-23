/**
 * Error codes that map to i18n translations in errors.json
 * Format: errors.{category}.{specific_error}
 */
export const ERROR_CODES = {
  // Auth errors
  AUTH_SIGNIN_FAILED: "errors:auth.signin_failed",
  AUTH_SIGNUP_FAILED: "errors:auth.signup_failed",
  AUTH_SIGNOUT_FAILED: "errors:auth.signout_failed",
  AUTH_EMAIL_VERIFICATION_FAILED: "errors:auth.email_verification_failed",
  AUTH_PASSWORD_REQUIREMENTS: "errors:auth.password_requirements",
  AUTH_EMAIL_INVALID: "errors:auth.email_invalid",
  AUTH_RATE_LIMITED: "errors:auth.rate_limited",
  AUTH_UNAUTHORIZED: "errors:auth.unauthorized",
  AUTH_SESSION_EXPIRED: "errors:auth.session_expired",
  AUTH_ACCOUNT_NOT_CONFIRMED: "errors:auth.account_not_confirmed",
  AUTH_PASSWORD_MISMATCH: "errors:auth.password_mismatch",
  AUTH_AGE_CONFIRMATION_REQUIRED: "errors:auth.age_confirmation_required",
  AUTH_TERMS_AGREEMENT_REQUIRED: "errors:auth.terms_agreement_required",

  // General errors
  NETWORK_ERROR: "errors:general.network_error",
  SERVER_ERROR: "errors:general.server_error",
  VALIDATION_FAILED: "errors:general.validation_failed",
  UNKNOWN_ERROR: "errors:general.unknown_error",
  RATE_LIMIT_EXCEEDED: "errors:general.rate_limit_exceeded",

  // Session errors
  SESSION_NOT_FOUND: "errors:session.not_found",
  SESSION_ACCESS_DENIED: "errors:session.access_denied",
  SESSION_CREATE_FAILED: "errors:session.create_failed",
  SESSION_READ_FAILED: "errors:session.read_failed",
  SESSION_UPDATE_FAILED: "errors:session.update_failed",
  SESSION_DELETE_FAILED: "errors:session.delete_failed",
  SESSION_SYNC_FAILED: "errors:session.sync_failed",
  SESSION_ENCRYPTION_FAILED: "errors:session.encryption_failed",
  SESSION_DECRYPTION_FAILED: "errors:session.decryption_failed",
  SESSION_SAVE_FAILED: "errors:session.save_failed",

  // User errors
  USER_NOT_FOUND: "errors:user.not_found",
  USER_CREATE_FAILED: "errors:user.create_failed",
  USER_UPDATE_FAILED: "errors:user.update_failed",
  USER_DELETE_FAILED: "errors:user.delete_failed",

  // Tester errors
  TESTER_NOT_FOUND: "errors:tester.not_found",
  TESTER_CREATE_FAILED: "errors:tester.create_failed",
  TESTER_UPDATE_FAILED: "errors:tester.update_failed",
  TESTER_DELETE_FAILED: "errors:tester.delete_failed",

  // AI errors
  AI_REQUEST_FAILED: "errors:ai.request_failed",
  AI_EMPTY_RESPONSE: "errors:ai.empty_response",
  AI_NETWORK_ERROR: "errors:ai.network_error",
  AI_OPENAI_ERROR: "errors:ai.openai_error",
  AI_OPENROUTER_ERROR: "errors:ai.openrouter_error",
  AI_INVALID_MODEL: "errors:ai.invalid_model",
  AI_INVALID_PROMPTS: "errors:ai.invalid_prompts",
  AI_RETRY_EXHAUSTED: "errors:ai.retry_exhausted",
  AI_UNSUPPORTED_VENDOR: "errors:ai.unsupported_vendor",

  // Chat errors
  CHAT_ANALYSIS_FAILED: "errors:chat.analysis_failed",
  CHAT_INVALID_INPUT: "errors:chat.invalid_input",
  CHAT_UNSUPPORTED_LOCALE: "errors:chat.unsupported_locale",
  CHAT_UNSUPPORTED_INTENSITY: "errors:chat.unsupported_intensity",
  CHAT_UNSUPPORTED_MODEL: "errors:chat.unsupported_model",
  CHAT_PROMPT_BUILD_FAILED: "errors:chat.prompt_build_failed",
  CHAT_RESPONSE_FAILED: "errors:chat.response_failed",

  // Crypto errors
  CRYPTO_ENCRYPTION_FAILED: "errors:crypto.encryption_failed",
  CRYPTO_DECRYPTION_FAILED: "errors:crypto.decryption_failed",
  CRYPTO_KEY_GENERATION_FAILED: "errors:crypto.key_generation_failed",
  CRYPTO_KEY_DERIVATION_FAILED: "errors:crypto.key_derivation_failed",
  CRYPTO_KEY_WRAP_FAILED: "errors:crypto.key_wrap_failed",
  CRYPTO_KEY_UNWRAP_FAILED: "errors:crypto.key_unwrap_failed",
  CRYPTO_KEY_STORAGE_FAILED: "errors:crypto.key_storage_failed",
  CRYPTO_KEY_RETRIEVAL_FAILED: "errors:crypto.key_retrieval_failed",
  CRYPTO_INVALID_KEY_PACKAGE: "errors:crypto.invalid_key_package",
  CRYPTO_WEBCRYPTO_UNAVAILABLE: "errors:crypto.webcrypto_unavailable",
  CRYPTO_MALFORMED_DATA: "errors:crypto.malformed_data",

  // Billing errors
  BILLING_OPERATION_FAILED: "errors:billing.operation_failed",
  BILLING_STRIPE_CUSTOMER_FAILED: "errors:billing.stripe_customer_failed",
  BILLING_PAYMENT_INTENT_FAILED: "errors:billing.payment_intent_failed",
  BILLING_CONFIG_INVALID: "errors:billing.config_invalid",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
