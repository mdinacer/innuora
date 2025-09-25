"use server";

import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { WrappedKeyPackage } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SignInSchema, SignInSchemaType, SignUpSchema, SignUpSchemaType } from "@/lib/zod/auth.schema";

export async function findCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function requireCurrentUser(): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    logger.logErrorAndThrow(ERROR_CODES.AUTH_SESSION_EXPIRED, error, { operation: "require_current_user" });
  }

  if (!data.user) {
    logger.logErrorAndThrow(ERROR_CODES.AUTH_SESSION_EXPIRED, new Error("No user found in session"), {
      operation: "require_current_user",
    });
  }

  return data.user!; // Non-null assertion since logErrorAndThrow throws
}

export async function requireAdmin() {
  const authUser = await requireCurrentUser();
  const user = await prisma.user.findUnique({ where: { authId: authUser.id } });

  if (!user?.role || user.role !== "admin") {
    logger.logErrorAndThrow(ERROR_CODES.AUTH_UNAUTHORIZED, new Error("Admin access denied"), {
      userId: authUser.id,
      operation: "require_admin",
      metadata: { userRole: user?.role || "none" },
    });
  }
  return user!; // Non-null assertion since logErrorAndThrow throws if unauthorized
}

export async function assertCurrentUserId(userId: string): Promise<void> {
  if (!userId || typeof userId !== "string") {
    logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Invalid user ID provided"), {
      operation: "assert_current_user_id",
      metadata: { providedUserId: userId },
    });
  }
  const currentUser = await requireCurrentUser();
  if (userId !== currentUser.id) {
    logger.logErrorAndThrow(ERROR_CODES.AUTH_UNAUTHORIZED, new Error("User ID mismatch"), {
      userId: currentUser.id,
      operation: "assert_current_user_id",
      metadata: { requestedUserId: userId },
    });
  }
}

export async function signUp(singUpData: SignUpSchemaType, wrappedKeyPackage?: WrappedKeyPackage) {
  const parsedData = SignUpSchema.parse(singUpData);
  const supabase = await createClient();
  const { email, password } = parsedData;

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
    ERROR_CODES.AUTH_SIGNUP_FAILED,
    {
      operation: "user_signup",
      userId: singUpData.email, // Use email as temp identifier
      metadata: {
        email: email.toLowerCase(),
        hasKeyPackage: !!wrappedKeyPackage,
        ageConfirmed: parsedData.ageConfirm,
        termsAccepted: parsedData.termsAgree,
      },
    },
    `User signup completed: ${email}`
  );

  redirect("/auth/verify-email/sent");
}

export async function signIn(signInData: SignInSchemaType) {
  const parsedData = SignInSchema.parse(signInData);
  const { remember, email, password } = parsedData;
  const supabase = await createClient(remember);

  return await logger.wrapOperation(
    async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error; // Will be caught and logged with proper error code
      }

      return data;
    },
    ERROR_CODES.AUTH_SIGNIN_FAILED,
    {
      operation: "user_signin",
      userId: email, // Use email as temp identifier
      metadata: {
        email: email.toLowerCase(),
        remember,
      },
    },
    `User signed in: ${email}`
  );
}

export async function signOut(scope?: "global" | "local" | "others") {
  const supabase = await createClient();
  const currentUser = await findCurrentUser();

  await logger.wrapOperation(
    async () => {
      await supabase.auth.signOut({ scope });
    },
    ERROR_CODES.AUTH_SIGNOUT_FAILED,
    {
      operation: "user_signout",
      userId: currentUser?.id,
      metadata: {
        sessionValid: !!currentUser,
      },
    },
    "User signed out successfully"
  );

  redirect("/auth/sign-in");
}

export async function resetPassword(email: string) {
  const supabase = await createClient();

  return await logger.wrapOperation(
    async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/password-reset/confirm`,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    },
    ERROR_CODES.AUTH_PASSWORD_RESET_FAILED,
    {
      operation: "password_reset_request",
      metadata: {
        email: email.toLowerCase(),
      },
    },
    `Password reset requested for: ${email}`
  );
}
