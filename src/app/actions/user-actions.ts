"use server";

import { User as AppUser, Prisma, ThemeMode } from "@prisma/client";
import { User as AuthUser } from "@supabase/supabase-js";

import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { UserWithRelations } from "@/types/user.types";
import { assertCurrentUserId, requireCurrentUser } from "./auth-actions";

// Core user functions
export async function getUserById(authUserId: string): Promise<AppUser | null> {
  await assertCurrentUserId(authUserId);

  return await logger.wrapOperation(
    () =>
      prisma.user.findUnique({
        where: { authId: authUserId },
      }),
    ERROR_CODES.SERVER_ERROR, // Database error only - null result is fine
    {
      operation: "user_get_by_id",
      userId: authUserId,
    }
  );
}
export async function getUserWithRelationsById(authUserId: string): Promise<UserWithRelations | null> {
  await assertCurrentUserId(authUserId);

  return await logger.wrapOperation(
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
      operation: "user_get_with_relations_by_id",
      userId: authUserId,
    }
  );
}

export async function getCurrentUser(): Promise<AppUser> {
  const currentAuthUser: AuthUser = await requireCurrentUser();
  const user = await getUserById(currentAuthUser.id);

  if (!user) {
    logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error("Current user not found in database"), {
      operation: "user_get_current",
      userId: currentAuthUser.id,
    });
  }

  return user!; // Non-null assertion since logErrorAndThrow throws
}

export async function getCurrentUserWithRelations(): Promise<UserWithRelations> {
  const currentAuthUser: AuthUser = await requireCurrentUser();
  const userWithRelations = await getUserWithRelationsById(currentAuthUser.id);

  if (!userWithRelations) {
    logger.logErrorAndThrow(
      ERROR_CODES.USER_NOT_FOUND,
      new Error("Current user with relations not found in database"),
      {
        operation: "user_get_current_with_relations",
        userId: currentAuthUser.id,
      }
    );
  }

  return userWithRelations!; // Non-null assertion since logErrorAndThrow throws
}

export async function createUserWithDefaults(authUserId: string): Promise<UserWithRelations> {
  return await logger.wrapOperation(
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
      operation: "user_create_with_defaults",
      userId: authUserId,
      metadata: {
        defaultTheme: ThemeMode.light,
        defaultLocale: "en",
        autoSave: false
      }
    },
    "User created with default settings"
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

  return await logger.wrapOperation(
    () =>
      prisma.user.update({
        where: { authId: authUserId },
        data: userData,
        include: { profile: true, config: true },
      }),
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "user_update_by_id",
      userId: authUserId,
      metadata: { 
        updateFields: Object.keys(userData),
        fieldsCount: Object.keys(userData).length
      },
    },
    "User profile updated"
  );
}

export async function updateCurrentUser(userData: Partial<Prisma.UserUpdateInput>): Promise<UserWithRelations> {
  const currentAuthUser = await requireCurrentUser();
  return await updateUserById(currentAuthUser.id, userData);
}

export async function deleteUserById(authUserId: string): Promise<boolean> {
  await assertCurrentUserId(authUserId);

  return await logger.wrapOperation(
    async () => {
      // Get user info before deletion for audit
      const user = await prisma.user.findUnique({
        where: { authId: authUserId },
        select: { id: true, authId: true, createdAt: true }
      });

      if (!user) {
        throw new Error(`User not found: ${authUserId}`);
      }

      await prisma.user.delete({
        where: { authId: authUserId },
      });

      return true;
    },
    ERROR_CODES.USER_DELETE_FAILED,
    {
      operation: "user_delete_by_id",
      userId: authUserId,
      metadata: {
        action: "delete_user_account"
      }
    },
    "User account deleted"
  );
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
