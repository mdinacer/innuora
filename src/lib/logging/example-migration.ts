/**
 * Example Migration: auth-actions.ts
 *
 * Shows before/after of migrating from separate audit/error systems
 * to the unified logger.
 */

// ===== BEFORE (Current Implementation) =====

/*
import { WrappedKeyPackage } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES, errorManager, mapSupabaseAuthError } from "@/lib/errors";
import { logAction } from "./audit-actions";

export async function signUp(singUpData: SignUpSchemaType, wrappedKeyPackage?: WrappedKeyPackage) {
  // ... validation and supabase call ...

  if (error) {
    errorManager.handleError(mapSupabaseAuthError(error), error, {
      operation: "signUp",
      metadata: { email: email.toLowerCase() },
    });
  }

  if (!data.user?.confirmation_sent_at) {
    errorManager.handleError(ERROR_CODES.AUTH_EMAIL_VERIFICATION_FAILED, new Error("No confirmation email sent"), {
      operation: "signUp",
      metadata: { email: email.toLowerCase() },
    });
  }

  // Log successful signup
  if (data.user) {
    await logAction(data.user.id, "signup", `User registered: ${email}`);
  }

  redirect("/auth/verify-email/sent");
}
*/

// ===== AFTER (Unified Logger) =====

import { redirect } from "next/navigation";

import { requireAdmin } from "@/app/actions/auth-actions";
import { WrappedKeyPackage } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
import { createClient } from "@/lib/supabase/server";
import { SignUpSchema, SignUpSchemaType } from "@/lib/zod/auth.schema";
import { prisma } from "../prisma";

export async function signUpUnified(singUpData: SignUpSchemaType, wrappedKeyPackage?: WrappedKeyPackage) {
  const parsedData = SignUpSchema.parse(singUpData);
  const supabase = await createClient();
  const { email, password } = parsedData;

  // Use unified logger with wrapOperation for cleaner code
  await logger.wrapOperation(
    async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            crypto: wrappedKeyPackage,
            ageConfirm: parsedData.ageConfirm,
            termsAgree: parsedData.termsAgree,
          },
        },
      });

      if (error) {
        throw error; // Will be caught and logged with proper error code
      }

      if (!data.user?.confirmation_sent_at) {
        throw new Error("No confirmation email sent");
      }

      return data;
    },
    ERROR_CODES.AUTH_SIGNUP_FAILED, // Single error code for signup failures
    {
      operation: "user_signup",
      metadata: {
        email: email.toLowerCase(),
        hasKeyPackage: !!wrappedKeyPackage,
        ageConfirmed: parsedData.ageConfirm,
        termsAccepted: parsedData.termsAgree,
      },
    },
    `User signup completed: ${email}` // Auto-logs success with audit trail
  );

  redirect("/auth/verify-email/sent");
}

// ===== COMPARISON: Missing Admin Operations (BEFORE vs AFTER) =====

// BEFORE: No logging at all
/*
export async function deleteTester(testerId: string) {
  await requireAdmin();
  return await prisma.tester.delete({ where: { id: testerId } });
}
*/

// AFTER: Full audit trail for admin operations
export async function deleteTesterUnified(testerId: string) {
  const admin = await requireAdmin();

  return await logger.wrapOperation(
    async () => {
      // Get tester info before deletion for audit
      const tester = await prisma.tester.findUnique({
        where: { id: testerId },
        select: { id: true, email: true, accepted: true },
      });

      if (!tester) {
        throw new Error(`Tester not found: ${testerId}`);
      }

      await prisma.tester.delete({ where: { id: testerId } });
      return tester;
    },
    ERROR_CODES.TESTER_DELETE_FAILED,
    {
      userId: admin.id,
      operation: "admin_delete_tester",
      metadata: {
        testerId,
        adminRole: admin.role,
        action: "delete_tester",
      },
    },
    "Admin deleted tester account" // Creates audit trail
  );
}

// ===== CLIENT-SIDE LOGGING EXAMPLE =====

// BEFORE: Inconsistent error handling
/*
// In React component
try {
  await updateSession(sessionData);
  toast.success("Session updated");
} catch (error) {
  console.error("Failed to update session:", error);
  toast.error("Failed to update session");
}
*/

// AFTER: Structured client-side logging
/*
// In React component
import { logger } from "@/lib/logging/unified-logger";

try {
  await updateSession(sessionData);
  toast.success("Session updated");
} catch (error) {
  // Log structured error for monitoring
  await logger.logWarning("Session update failed", {
    operation: "client_session_update",
    metadata: {
      component: "SessionEditForm",
      sessionId: sessionData.id,
      errorMessage: error instanceof Error ? error.message : String(error),
      userAgent: navigator.userAgent
    }
  });
  
  toast.error("Failed to update session");
}
*/

// ===== KEY BENEFITS DEMONSTRATED =====

/*
1. **Simplified Code**: 
   - No need to call both errorManager.handleError() AND logAction()
   - Single wrapOperation handles both success/failure logging

2. **Rich Context**: 
   - More detailed metadata for debugging
   - Consistent operation naming convention
   - User tracking built-in

3. **Admin Operations Coverage**:
   - Previously unlogged admin actions now have audit trails
   - Compliance-ready logging for sensitive operations

4. **Flexible Error Handling**:
   - Can map multiple error types to single error codes
   - Automatic retry/fallback logic possible
   - External service integration ready

5. **Non-Breaking Migration**:
   - Old functions still work via exports
   - Can migrate gradually file by file
   - No immediate refactoring required
*/
