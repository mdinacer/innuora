"use server";

import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { AuthenticationError, AuthorizationError } from "@/errors/auth.errors";
import { generateUserSalt } from "@/lib/crypto/  session-encryption";
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
    throw new AuthenticationError(error.message);
  }

  if (!data.user) {
    throw new AuthenticationError("No authenticated user found. Please log in.");
  }

  return data.user;
}

export async function requireAdmin() {
  const authUser = await requireCurrentUser();
  const user = await prisma.user.findUnique({ where: { authId: authUser.id } });
  if (!user?.role || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function assertCurrentUserId(userId: string): Promise<void> {
  if (!userId || typeof userId !== "string") {
    throw new AuthorizationError("Invalid user ID provided");
  }
  const currentUser = await requireCurrentUser();
  if (userId !== currentUser.id) {
    throw new AuthorizationError(`Access denied. User ID mismatch.`);
  }
}

export async function signUp(singUpData: SignUpSchemaType) {
  const parsedData = SignUpSchema.parse(singUpData);
  const supabase = await createClient();

  const { email, password } = parsedData;

  const salt = generateUserSalt();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        encryptionSalt: salt,
        ageConfirm: parsedData.ageConfirm,
        termsAgree: parsedData.termsAgree,
      },
    },
  });

  if (error) {
    console.error(error.code, error.message);
    throw error;
  }

  if (!data.user?.confirmation_sent_at) {
    console.error("no confirmation_sent_at");
    throw error;
  }

  redirect("/auth/verify-email/sent");
}

export async function signIn(signInData: SignInSchemaType) {
  const parsedData = SignInSchema.parse(signInData);
  const supabase = await createClient();
  const { email, password } = parsedData;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error.code, error.message);
    throw error;
    //redirect(`/auth/sign-in?error=${error.code}`);
  }

  //redirect("/sessions");

  return data;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
