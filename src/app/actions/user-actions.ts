"use server";

import { User as AppUser, Prisma, ThemeMode } from "@prisma/client";
import { User as AuthUser } from "@supabase/supabase-js";

import { ERROR_CODES, errorManager } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { UserWithRelations } from "@/types/user.types";
import { assertCurrentUserId, requireCurrentUser } from "./auth-actions";

// Core user functions
export async function getUserById(authUserId: string): Promise<AppUser | null> {
  await assertCurrentUserId(authUserId);

  return await errorManager.wrapOperation(
    () =>
      prisma.user.findUnique({
        where: { authId: authUserId },
      }),
    ERROR_CODES.SERVER_ERROR, // Database error only - null result is fine
    {
      operation: "getUserById",
      userId: authUserId,
    }
  );
}
export async function getUserWithRelationsById(authUserId: string): Promise<UserWithRelations | null> {
  await assertCurrentUserId(authUserId);

  return await errorManager.wrapOperation(
    () =>
      prisma.user.findUnique({
        where: { authId: authUserId },
        include: {
          profile: true,
          config: true,
        },
      }),
    ERROR_CODES.SERVER_ERROR,
    {
      operation: "getUserWithRelationsById",
      userId: authUserId,
    }
  );
}

export async function getCurrentUser(): Promise<AppUser> {
  const currentAuthUser: AuthUser = await requireCurrentUser();
  const user = await getUserById(currentAuthUser.id);

  if (!user) {
    errorManager.handleError(ERROR_CODES.USER_NOT_FOUND, new Error("Current user not found in database"), {
      operation: "getCurrentUser",
      userId: currentAuthUser.id,
    });
  }

  return user!; // Non-null assertion since handleError throws
}

export async function getCurrentUserWithRelations(): Promise<UserWithRelations> {
  const currentAuthUser: AuthUser = await requireCurrentUser();
  const userWithRelations = await getUserWithRelationsById(currentAuthUser.id);

  if (!userWithRelations) {
    errorManager.handleError(
      ERROR_CODES.USER_NOT_FOUND,
      new Error("Current user with relations not found in database"),
      {
        operation: "getCurrentUserWithRelations",
        userId: currentAuthUser.id,
      }
    );
  }

  return userWithRelations!; // Non-null assertion since handleError throws
}

export async function createUserWithDefaults(authUserId: string): Promise<UserWithRelations> {
  return await errorManager.wrapOperation(
    () =>
      prisma.user.create({
        data: {
          authId: authUserId,
          config: {
            create: {
              autoSave: false,
              theme: ThemeMode.light,
              locale: "en",
            },
          },
          profile: {
            create: {},
          },
        },
        include: {
          config: true,
          profile: true,
        },
      }),
    ERROR_CODES.USER_CREATE_FAILED,
    {
      operation: "createUserWithDefaults",
      userId: authUserId,
    }
  );
}

export async function findOrCreateUser(authUserId: string): Promise<UserWithRelations> {
  const existingUser = await getUserWithRelationsById(authUserId);

  if (existingUser) {
    return existingUser;
  }

  return await createUserWithDefaults(authUserId);
}

export async function updateUserById(
  authUserId: string,
  userData: Partial<Prisma.UserUpdateInput>
): Promise<UserWithRelations> {
  await assertCurrentUserId(authUserId);

  return await errorManager.wrapOperation(
    () =>
      prisma.user.update({
        where: { authId: authUserId },
        data: userData,
        include: { profile: true, config: true },
      }),
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "updateUserById",
      userId: authUserId,
      metadata: { updateFields: Object.keys(userData) },
    }
  );
}

export async function updateCurrentUser(userData: Partial<Prisma.UserUpdateInput>): Promise<UserWithRelations> {
  const currentAuthUser = await requireCurrentUser();
  return await updateUserById(currentAuthUser.id, userData);
}

export async function deleteUserById(authUserId: string): Promise<boolean> {
  await assertCurrentUserId(authUserId);

  const deletedUser = await errorManager.wrapOperation(
    () =>
      prisma.user.delete({
        where: { authId: authUserId },
      }),
    ERROR_CODES.USER_DELETE_FAILED,
    {
      operation: "deleteUserById",
      userId: authUserId,
    }
  );

  return !!deletedUser;
}

export async function deleteCurrentUser(): Promise<boolean> {
  const currentAuthUser = await requireCurrentUser();
  return await deleteUserById(currentAuthUser.id);
}

export async function checkUserExists(authUserId: string): Promise<boolean> {
  try {
    const user = await getUserById(authUserId);
    return !!user;
  } catch {
    // For this function, we want to return false on any error (including access denied)
    // since it's a simple existence check
    return false;
  }
}
