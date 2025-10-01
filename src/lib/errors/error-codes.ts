/**
 * Error codes that map to i18n translations in errors.json
 * Format: errors.{category}.{specific_error}
 */
export const ERROR_CODES = {
  // Auth errors - Generic
  AUTH_SIGNIN_FAILED: "errors:auth.signin_failed",
  AUTH_SIGNUP_FAILED: "errors:auth.signup_failed",
  AUTH_SIGNOUT_FAILED: "errors:auth.signout_failed",
  AUTH_PASSWORD_RESET_FAILED: "errors:auth.password_reset_failed",
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

  // Auth errors - Specific Supabase codes (email/password flow)
  AUTH_INVALID_CREDENTIALS: "errors:auth.invalid_credentials",
  AUTH_USER_NOT_FOUND: "errors:auth.user_not_found",
  AUTH_EMAIL_EXISTS: "errors:auth.email_exists",
  AUTH_USER_ALREADY_EXISTS: "errors:auth.user_already_exists",
  AUTH_EMAIL_NOT_CONFIRMED: "errors:auth.email_not_confirmed",
  AUTH_WEAK_PASSWORD: "errors:auth.weak_password",
  AUTH_EMAIL_ADDRESS_INVALID: "errors:auth.email_address_invalid",
  AUTH_VALIDATION_FAILED: "errors:auth.validation_failed",
  AUTH_SIGNUP_DISABLED: "errors:auth.signup_disabled",
  AUTH_USER_BANNED: "errors:auth.user_banned",
  AUTH_OVER_REQUEST_RATE_LIMIT: "errors:auth.over_request_rate_limit",
  AUTH_OVER_EMAIL_SEND_RATE_LIMIT: "errors:auth.over_email_send_rate_limit",
  AUTH_BAD_JWT: "errors:auth.bad_jwt",
  AUTH_REFRESH_TOKEN_NOT_FOUND: "errors:auth.refresh_token_not_found",
  AUTH_REFRESH_TOKEN_ALREADY_USED: "errors:auth.refresh_token_already_used",

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

  // Validation errors
  VALIDATION_EMAIL_INVALID: "errors:validation.email_invalid",
  VALIDATION_EMAIL_REQUIRED: "errors:validation.email_required",
  VALIDATION_EMAIL_TOO_LONG: "errors:validation.email_too_long",
  VALIDATION_PASSWORD_REQUIRED: "errors:validation.password_required",
  VALIDATION_PASSWORD_TOO_SHORT: "errors:validation.password_too_short",
  VALIDATION_PASSWORD_TOO_LONG: "errors:validation.password_too_long",
  VALIDATION_PASSWORD_WEAK: "errors:validation.password_weak",
  VALIDATION_PASSWORD_MISMATCH: "errors:validation.password_mismatch",
  VALIDATION_DISPLAY_NAME_REQUIRED: "errors:validation.display_name_required",
  VALIDATION_DISPLAY_NAME_TOO_LONG: "errors:validation.display_name_too_long",
  VALIDATION_UUID_INVALID: "errors:validation.uuid_invalid",
  VALIDATION_STRING_TOO_SHORT: "errors:validation.string_too_short",
  VALIDATION_STRING_TOO_LONG: "errors:validation.string_too_long",
  VALIDATION_NUMBER_INVALID: "errors:validation.number_invalid",
  VALIDATION_NUMBER_TOO_SMALL: "errors:validation.number_too_small",
  VALIDATION_NUMBER_TOO_LARGE: "errors:validation.number_too_large",
  VALIDATION_DATE_INVALID: "errors:validation.date_invalid",
  VALIDATION_ENUM_INVALID: "errors:validation.enum_invalid",
  VALIDATION_ARRAY_EMPTY: "errors:validation.array_empty",
  VALIDATION_ARRAY_TOO_LARGE: "errors:validation.array_too_large",
  VALIDATION_BOOLEAN_REQUIRED: "errors:validation.boolean_required",
  VALIDATION_JSON_INVALID: "errors:validation.json_invalid",
  VALIDATION_SCHEMA_PARSE_FAILED: "errors:validation.schema_parse_failed",

  // Environment/Configuration errors
  ENV_VARIABLE_MISSING: "errors:env.variable_missing",
  ENV_VARIABLE_INVALID: "errors:env.variable_invalid",
  ENV_DATABASE_URL_MISSING: "errors:env.database_url_missing",
  ENV_AUTH_CONFIG_MISSING: "errors:env.auth_config_missing",
  ENV_AI_CONFIG_MISSING: "errors:env.ai_config_missing",
  ENV_BILLING_CONFIG_MISSING: "errors:env.billing_config_missing",
  ENV_VALIDATION_FAILED: "errors:env.validation_failed",
  CONFIG_INVALID: "errors:config.invalid",
  CONFIG_MISSING: "errors:config.missing",
  CONFIG_PARSE_FAILED: "errors:config.parse_failed",

  // Database constraint errors
  DB_CONNECTION_FAILED: "errors:db.connection_failed",
  DB_QUERY_FAILED: "errors:db.query_failed",
  DB_TRANSACTION_FAILED: "errors:db.transaction_failed",
  DB_CONSTRAINT_VIOLATION: "errors:db.constraint_violation",
  DB_UNIQUE_CONSTRAINT_VIOLATION: "errors:db.unique_constraint_violation",
  DB_FOREIGN_KEY_CONSTRAINT_VIOLATION: "errors:db.foreign_key_constraint_violation",
  DB_NOT_NULL_CONSTRAINT_VIOLATION: "errors:db.not_null_constraint_violation",
  DB_CHECK_CONSTRAINT_VIOLATION: "errors:db.check_constraint_violation",
  DB_RECORD_NOT_FOUND: "errors:db.record_not_found",
  DB_DUPLICATE_RECORD: "errors:db.duplicate_record",
  DB_TIMEOUT: "errors:db.timeout",
  DB_MIGRATION_FAILED: "errors:db.migration_failed",

  // File/Resource errors
  FILE_NOT_FOUND: "errors:file.not_found",
  FILE_ACCESS_DENIED: "errors:file.access_denied",
  FILE_READ_FAILED: "errors:file.read_failed",
  FILE_WRITE_FAILED: "errors:file.write_failed",
  FILE_DELETE_FAILED: "errors:file.delete_failed",
  FILE_TOO_LARGE: "errors:file.too_large",
  FILE_INVALID_TYPE: "errors:file.invalid_type",
  FILE_CORRUPTED: "errors:file.corrupted",
  RESOURCE_NOT_FOUND: "errors:resource.not_found",
  RESOURCE_UNAVAILABLE: "errors:resource.unavailable",
  RESOURCE_EXHAUSTED: "errors:resource.exhausted",

  // Enhanced Rate Limiting errors
  RATE_LIMIT_AI_REQUESTS: "errors:rate_limit.ai_requests",
  RATE_LIMIT_AI_BURST: "errors:rate_limit.ai_burst",
  RATE_LIMIT_SESSION_CREATION: "errors:rate_limit.session_creation",
  RATE_LIMIT_CREDIT_PURCHASE: "errors:rate_limit.credit_purchase",
  RATE_LIMIT_AUTH_ATTEMPTS: "errors:rate_limit.auth_attempts",
  RATE_LIMIT_GENERAL_API: "errors:rate_limit.general_api",
  RATE_LIMIT_MESSAGE_SENDING: "errors:rate_limit.message_sending",
  RATE_LIMIT_FILE_UPLOAD: "errors:rate_limit.file_upload",
  RATE_LIMIT_EXPORT_REQUESTS: "errors:rate_limit.export_requests",

  // Memory/Session Management errors
  MEMORY_ALLOCATION_FAILED: "errors:memory.allocation_failed",
  MEMORY_LIMIT_EXCEEDED: "errors:memory.limit_exceeded",
  SESSION_MEMORY_FULL: "errors:session.memory_full",
  SESSION_TIMEOUT: "errors:session.timeout",
  SESSION_INVALID_STATE: "errors:session.invalid_state",
  SESSION_CONCURRENT_MODIFICATION: "errors:session.concurrent_modification",

  // Content/Message errors
  CONTENT_TOO_LONG: "errors:content.too_long",
  CONTENT_INAPPROPRIATE: "errors:content.inappropriate",
  CONTENT_EMPTY: "errors:content.empty",
  MESSAGE_DUPLICATE: "errors:message.duplicate",
  MESSAGE_TOO_FREQUENT: "errors:message.too_frequent",
  MESSAGE_INVALID_FORMAT: "errors:message.invalid_format",

  // Feature/Permission errors
  FEATURE_NOT_AVAILABLE: "errors:feature.not_available",
  FEATURE_DISABLED: "errors:feature.disabled",
  PERMISSION_DENIED: "errors:permission.denied",
  PERMISSION_INSUFFICIENT: "errors:permission.insufficient",
  SUBSCRIPTION_REQUIRED: "errors:subscription.required",
  CREDITS_INSUFFICIENT: "errors:credits.insufficient",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
