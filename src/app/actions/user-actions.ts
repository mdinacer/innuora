"use server";

import { User as AppUser, Prisma, ThemeMode } from "@prisma/client";
import { User as AuthUser } from "@supabase/supabase-js";

import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { UpdateUserProfileSchema, UpdateUserProfileSchemaType } from "@/lib/zod/user-actions.schema";
import type { ActionResult } from "@/types/action-result";
import { UserWithRelations } from "@/types/user.types";
import { assertCurrentUserId, requireCurrentUser } from "./auth-actions";

// Core user functions
export async function getUserById(authUserId: string): Promise<ActionResult<AppUser | null>> {
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
export async function getUserWithRelationsById(authUserId: string): Promise<ActionResult<UserWithRelations | null>> {
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
  const userResult = await getUserById(currentAuthUser.id);

  if (userResult.error) {
    logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error(userResult.error.message), {
      operation: "user_get_current",
      userId: currentAuthUser.id,
    });
  }

  const user = userResult.data;

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
  const userResult = await getUserWithRelationsById(currentAuthUser.id);

  if (userResult.error) {
    logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error(userResult.error.message), {
      operation: "user_get_current_with_relations",
      userId: currentAuthUser.id,
    });
  }

  const userWithRelations = userResult.data;

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

export async function createUserWithDefaults(authUserId: string): Promise<ActionResult<UserWithRelations>> {
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
        autoSave: false,
      },
    },
    "User created with default settings"
  );
}

export async function findOrCreateUser(authUserId: string): Promise<ActionResult<UserWithRelations>> {
  return (await logger.wrapOperation(
    async () => {
      const existingUserResult = await getUserWithRelationsById(authUserId);

      if (existingUserResult.error) {
        // If there's an error fetching, try to create
        const createResult = await createUserWithDefaults(authUserId);
        if (createResult.error || !createResult.data) {
          logger.logErrorAndThrow(
            ERROR_CODES.USER_CREATE_FAILED,
            new Error(createResult.error?.message || "Failed to create user"),
            {
              operation: "find_or_create_user",
              userId: authUserId,
              metadata: { reason: "create_failed_after_fetch_error" },
            }
          );
        }
        return createResult.data;
      }

      if (existingUserResult.data) {
        return existingUserResult.data;
      }

      // User doesn't exist, create it
      const createResult = await createUserWithDefaults(authUserId);
      if (createResult.error || !createResult.data) {
        logger.logErrorAndThrow(
          ERROR_CODES.USER_CREATE_FAILED,
          new Error(createResult.error?.message || "Failed to create user"),
          {
            operation: "find_or_create_user",
            userId: authUserId,
            metadata: { reason: "create_failed_user_not_found" },
          }
        );
      }
      return createResult.data;
    },
    ERROR_CODES.USER_NOT_FOUND,
    {
      operation: "find_or_create_user",
      userId: authUserId,
    }
  )) as ActionResult<UserWithRelations>;
}

export async function updateUserById(
  authUserId: string,
  userData: Partial<Prisma.UserUpdateInput>
): Promise<ActionResult<UserWithRelations>> {
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
        fieldsCount: Object.keys(userData).length,
      },
    },
    "User profile updated"
  );
}

export async function updateCurrentUser(
  userData: Partial<Prisma.UserUpdateInput>
): Promise<ActionResult<UserWithRelations>> {
  const currentAuthUser = await requireCurrentUser();
  return await updateUserById(currentAuthUser.id, userData);
}

/**
 * GDPR-compliant user deletion (Right to Erasure - Article 17)
 * Permanently deletes user and ALL associated data
 */
export async function deleteUserById(authUserId: string): Promise<ActionResult<boolean>> {
  await assertCurrentUserId(authUserId);

  return await logger.wrapOperation(
    async () => {
      // Get user info before deletion for audit
      const user = await prisma.user.findUnique({
        where: { authId: authUserId },
        select: { id: true, authId: true, createdAt: true },
      });

      if (!user) {
        logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error(`User not found: ${authUserId}`), {
          operation: "user_delete_by_id",
          userId: authUserId,
        });
        throw new Error("Unreachable");
      }

      // GDPR-compliant complete deletion in transaction
      await prisma.$transaction(async (tx) => {
        // 1. Delete all audit logs (explicit deletion - references authId)
        await tx.auditLog.deleteMany({ where: { userId: authUserId } });

        // 2. Delete all sessions (CASCADE should work but explicit for certainty)
        await tx.session.deleteMany({ where: { userId: user.id } });

        // 3. Delete all credit transactions
        await tx.creditTransaction.deleteMany({ where: { userId: user.id } });

        // 4. Delete all subscription renewals first (foreign key constraint)
        const subscriptions = await tx.subscription.findMany({
          where: { userId: user.id },
          select: { id: true },
        });
        for (const sub of subscriptions) {
          await tx.subscriptionRenewal.deleteMany({ where: { subscriptionId: sub.id } });
        }

        // 5. Delete all subscriptions
        await tx.subscription.deleteMany({ where: { userId: user.id } });

        // 6. Delete profile
        await tx.profile.deleteMany({ where: { userId: user.id } });

        // 7. Delete user config
        await tx.userConfig.deleteMany({ where: { userId: user.id } });

        // 8. Finally delete user
        await tx.user.delete({ where: { authId: authUserId } });
      });

      // 9. Delete from Supabase Auth (outside transaction)
      try {
        const supabase = await createClient();
        const { error: authError } = await supabase.auth.admin.deleteUser(authUserId);

        if (authError) {
          logger.logWarning("Failed to delete user from Supabase Auth", {
            operation: "user_delete_supabase_auth",
            userId: authUserId,
            metadata: { error: authError.message },
          });
          // Log but don't fail - database deletion already succeeded
        }
      } catch (authDeleteError) {
        logger.logWarning("Exception during Supabase Auth deletion", {
          operation: "user_delete_supabase_auth",
          userId: authUserId,
          metadata: { error: String(authDeleteError) },
        });
      }

      // 10. Verify deletion (GDPR requirement - must confirm erasure)
      const remainingUser = await prisma.user.findUnique({
        where: { authId: authUserId },
      });

      const remainingAuditLogs = await prisma.auditLog.count({
        where: { userId: authUserId },
      });

      if (remainingUser || remainingAuditLogs > 0) {
        logger.logErrorAndThrow(
          ERROR_CODES.USER_DELETE_FAILED,
          new Error("User deletion verification failed - data still exists"),
          {
            operation: "user_delete_verification",
            userId: authUserId,
            metadata: {
              remainingUser: !!remainingUser,
              remainingAuditLogs,
            },
          }
        );
      }

      return true;
    },
    ERROR_CODES.USER_DELETE_FAILED,
    {
      operation: "user_delete_by_id",
      userId: authUserId,
      metadata: {
        action: "gdpr_right_to_erasure",
        compliance: "GDPR Article 17",
      },
    },
    "User account and all associated data permanently deleted (GDPR compliant)"
  );
}

export async function deleteCurrentUser(): Promise<ActionResult<boolean>> {
  const currentAuthUser = await requireCurrentUser();
  return await deleteUserById(currentAuthUser.id);
}

export async function checkUserExists(authUserId: string): Promise<boolean> {
  try {
    const result = await getUserById(authUserId);
    if (result.error) {
      return false;
    }
    return !!result.data;
  } catch {
    // For this function, we want to return false on any error (including access denied)
    // since it's a simple existence check
    return false;
  }
}

/**
 * Updates user profile information (display name and locale)
 */
export async function updateUserProfile(
  profileData: UpdateUserProfileSchemaType
): Promise<ActionResult<UserWithRelations>> {
  // Validate input
  const validatedData = UpdateUserProfileSchema.parse(profileData);

  const currentAuthUser = await requireCurrentUser();

  const currentUser = await getCurrentUser();

  return (await logger.wrapOperation(
    async () => {
      return await prisma.$transaction(async (tx) => {
        const { displayName, locale } = validatedData;

        // Build the nested update data
        const updateData: any = {};

        if (displayName !== undefined) {
          updateData.profile = {
            upsert: {
              create: { displayName },
              update: { displayName },
            },
          };
        }

        if (locale !== undefined) {
          updateData.config = {
            upsert: {
              create: {
                locale,
                autoSave: false,
                theme: ThemeMode.system,
              },
              update: { locale },
            },
          };
        }

        // Single update with nested writes
        const updatedUser = await tx.user.update({
          where: { id: currentUser.id },
          data: updateData,
          include: {
            profile: true,
            config: true,
          },
        });

        return updatedUser;
      });
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "user_profile_update",
      userId: currentAuthUser.id,
      metadata: {
        updateFields: Object.keys(validatedData),
        hasDisplayName: !!validatedData.displayName,
        hasLocale: !!validatedData.locale,
        displayNameLength: validatedData.displayName?.length || 0,
      },
    },
    "User profile updated successfully"
  )) as ActionResult<UserWithRelations>;
}
