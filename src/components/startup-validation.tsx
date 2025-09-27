"use client";

import { useEffect } from "react";

import { EnvironmentValidationError, validateClientEnvironment } from "@/lib/env-validation";

/**
 * Client-side environment validation component
 * This runs once on app startup to validate critical environment variables
 */
export function StartupValidation() {
  useEffect(() => {
    try {
      // Only validate in development or when explicitly enabled
      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VALIDATE_ENV === "true") {
        // Validate public environment variables only on client side
        validateClientEnvironment();
      }
    } catch (error) {
      if (error instanceof EnvironmentValidationError) {
        console.error("❌ Environment validation failed:", error.message);
        // In production, you might want to show a user-friendly error or redirect
      } else {
        console.error("❌ Unexpected error during environment validation:", error);
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
