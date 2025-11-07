/**
 * Environment variable validation to prevent runtime crashes
 * Call validateEnvironmentVariables() at application startup
 */

const REQUIRED_ENV_VARS = ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"];

const OPTIONAL_ENV_VARS = ["OPENAI_API_KEY", "OPEN_ROUTER_API_KEY", "STRIPE_SECRET_KEY"];

const CLIENT_REQUIRED_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"];

/**
 * Validate required environment variables
 * Throws error if critical variables are missing
 */
export function validateEnvironmentVariables(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Please check your .env.local file. See .env.example for reference.`
    );
  }

  // Require at least one AI provider
  if (!process.env.OPENAI_API_KEY && !process.env.OPEN_ROUTER_API_KEY) {
    throw new Error(
      `At least one AI provider API key is required: OPENAI_API_KEY or OPEN_ROUTER_API_KEY\n` +
        `The application cannot function without AI services.`
    );
  }

  // Warn about missing optional variables
  const missingOptional = OPTIONAL_ENV_VARS.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn("⚠️  Missing optional environment variables:", missingOptional.join(", "));
    console.warn("Some features may not work correctly. See .env.example for reference.");
  }

  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes(".supabase.co")) {
    console.warn("⚠️  NEXT_PUBLIC_SUPABASE_URL may not be a valid Supabase URL");
  }

  console.log("✅ Environment variables validated successfully");
}

/**
 * Validate client-side environment variables
 * Only checks NEXT_PUBLIC_ variables available on the client
 */
export function validateClientEnvironment(): void {
  const missing = CLIENT_REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required client environment variables: ${missing.join(", ")}\n` +
        `Please check your .env.local file. See .env.example for reference.`
    );
  }

  console.log("✅ Client environment variables validated successfully");
}

/**
 * Get a required environment variable with clear error message
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is not set.\nPlease add ${key}=your_value to your .env.local file.`
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
