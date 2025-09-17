"use server";

import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { WrappedKeyPackage } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES, errorManager, mapSupabaseAuthError } from "@/lib/errors";
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
    errorManager.handleError(ERROR_CODES.AUTH_SESSION_EXPIRED, error, { operation: "requireCurrentUser" });
  }

  if (!data.user) {
    errorManager.handleError(ERROR_CODES.AUTH_SESSION_EXPIRED, new Error("No user found in session"), {
      operation: "requireCurrentUser",
    });
  }

  return data.user!; // Non-null assertion since handleError throws
}

export async function requireAdmin() {
  const authUser = await requireCurrentUser();
  const user = await prisma.user.findUnique({ where: { authId: authUser.id } });

  if (!user?.role || user.role !== "admin") {
    errorManager.handleError(ERROR_CODES.AUTH_UNAUTHORIZED, new Error("Admin access denied"), {
      userId: authUser.id,
      operation: "requireAdmin",
      metadata: { userRole: user?.role || "none" },
    });
  }
  return user!; // Non-null assertion since handleError throws if unauthorized
}

export async function assertCurrentUserId(userId: string): Promise<void> {
  if (!userId || typeof userId !== "string") {
    errorManager.handleError(ERROR_CODES.VALIDATION_FAILED, new Error("Invalid user ID provided"), {
      operation: "assertCurrentUserId",
      metadata: { providedUserId: userId },
    });
  }
  const currentUser = await requireCurrentUser();
  if (userId !== currentUser.id) {
    errorManager.handleError(ERROR_CODES.AUTH_UNAUTHORIZED, new Error("User ID mismatch"), {
      userId: currentUser.id,
      operation: "assertCurrentUserId",
      metadata: { requestedUserId: userId },
    });
  }
}

export async function signUp(singUpData: SignUpSchemaType, wrappedKeyPackage?: WrappedKeyPackage) {
  const parsedData = SignUpSchema.parse(singUpData);
  const supabase = await createClient();

  const { email, password } = parsedData;

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

  redirect("/auth/verify-email/sent");
}

export async function signIn(signInData: SignInSchemaType) {
  const parsedData = SignInSchema.parse(signInData);
  const { remember } = parsedData;
  const supabase = await createClient(remember);
  const { email, password } = parsedData;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errorManager.handleError(mapSupabaseAuthError(error), error, {
      operation: "signIn",
      metadata: { email: email.toLowerCase(), remember },
    });
  }
  return data;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
