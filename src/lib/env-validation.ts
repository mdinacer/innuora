/* eslint-disable @typescript-eslint/no-use-before-define */
// Environment variable validation to prevent runtime crashes

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RequiredEnvVars {
  // Database
  DATABASE_URL: string;
  DIRECT_URL?: string;

  // Authentication (Supabase)
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;

  // AI Services
  OPENAI_API_KEY?: string;
  OPEN_ROUTER_API_KEY?: string;

  // Payment (Optional - can use different providers)
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;

  // Application
  NEXT_PUBLIC_DEFAULT_MODEL_CODE?: string;
}

export class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvironmentValidationError";
  }
}

/**
 * Validate required environment variables
 * Call this at application startup to fail fast on missing config
 */
export function validateEnvironmentVariables(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Critical variables (app won't work without these)
  const critical = ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"];

  // Important variables (features won't work without these)
  const important = ["OPENAI_API_KEY", "OPEN_ROUTER_API_KEY"];

  // Check critical variables
  for (const key of critical) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check important variables (warnings only)
  for (const key of important) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  // Fail if critical variables are missing
  if (missing.length > 0) {
    throw new EnvironmentValidationError(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Please check your .env.local file and ensure these variables are set.\n` +
        `See .env.example for reference.`
    );
  }

  // Check AI provider requirement (need at least one)
  if (!process.env.OPENAI_API_KEY && !process.env.OPEN_ROUTER_API_KEY) {
    throw new EnvironmentValidationError(
      `At least one AI provider API key is required: OPENAI_API_KEY or OPEN_ROUTER_API_KEY\n` +
        `The application cannot function without AI services.`
    );
  }

  // Log warnings for missing optional variables
  if (warnings.length > 0) {
    console.warn("⚠️ Missing optional environment variables:", warnings.join(", "));
    console.warn("Some features may not work correctly. See .env.example for reference.");
  }

  // Log success
  console.log("✅ Environment variables validated successfully");

  // Additional validation for specific values
  validateSpecificValues();
}

/**
 * Validate specific environment variable values
 */
function validateSpecificValues(): void {
  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes(".supabase.co")) {
    console.warn("⚠️ NEXT_PUBLIC_SUPABASE_URL may not be a valid Supabase URL");
  }

  // Validate model code
  const modelCode = process.env.NEXT_PUBLIC_DEFAULT_MODEL_CODE;
  if (modelCode && !["M1", "M2", "M3"].includes(modelCode)) {
    console.warn("⚠️ NEXT_PUBLIC_DEFAULT_MODEL_CODE should be M1, M2, or M3");
  }
}

/**
 * Get a required environment variable with clear error message
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new EnvironmentValidationError(
      `Required environment variable ${key} is not set.\n` + `Please add ${key}=your_value to your .env.local file.`
    );
  }
  return value;
}

/**
 * Get an optional environment variable with default
 */
export function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Validate client-side environment variables
 * Only validates NEXT_PUBLIC_ variables that are available on the client
 */
export function validateClientEnvironment(): void {
  const missing: string[] = [];

  // Critical client-side variables
  const clientCritical = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"];

  // Check critical client variables
  for (const key of clientCritical) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Fail if critical variables are missing
  if (missing.length > 0) {
    throw new EnvironmentValidationError(
      `Missing required client environment variables: ${missing.join(", ")}\n` +
        `Please check your .env.local file and ensure these variables are set.\n` +
        `See .env.example for reference.`
    );
  }

  // Log success
  console.log("✅ Client environment variables validated successfully");
}
