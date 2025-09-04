"use server";

import { User as AppUser, Prisma, ThemeMode } from "@prisma/client";
import { User as AuthUser } from "@supabase/supabase-js";

import { UserCreationError, UserDeletionError, UserNotFoundError, UserUpdateError } from "@/errors/user-errors";
import { prisma } from "@/lib/prisma";
import { UserWithRelations } from "@/types/user.types";
import { assertCurrentUserId, requireCurrentUser } from "./auth-actions";

// Core user functions
export async function getUserById(authUserId: string): Promise<AppUser | null> {
  try {
    await assertCurrentUserId(authUserId);

    const user = await prisma.user.findUnique({
      where: { authId: authUserId },
    });

    return user;
  } catch (error) {
    console.error(`Error fetching user with ID ${authUserId}:`, error);
    throw error;
  }
}
export async function getUserWithRelationsById(authUserId: string): Promise<UserWithRelations | null> {
  await assertCurrentUserId(authUserId);

  const userWithRelations = await prisma.user.findUnique({
    where: { authId: authUserId },
    include: {
      profile: true,
      config: true,
    },
  });

  return userWithRelations;
}

export async function getCurrentUser(): Promise<AppUser> {
  const currentAuthUser: AuthUser = await requireCurrentUser();
  const user = await getUserById(currentAuthUser.id);

  if (!user) {
    throw new UserNotFoundError(currentAuthUser.id);
  }

  return user;
}

export async function getCurrentUserWithRelations(): Promise<UserWithRelations> {
  const currentAuthUser: AuthUser = await requireCurrentUser();
  const userWithRelations = await getUserWithRelationsById(currentAuthUser.id);

  if (!userWithRelations) {
    throw new UserNotFoundError(currentAuthUser.id);
  }

  return userWithRelations;
}

export async function createUserWithDefaults(authUserId: string): Promise<UserWithRelations> {
  try {
    const newUser = await prisma.user.create({
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
    });

    return newUser;
  } catch (error) {
    console.error(`Error creating user with auth ID ${authUserId}:`, error);
    throw new UserCreationError(`Unable to create user with auth ID ${authUserId}`, error);
  }
}

export async function findOrCreateUser(authUserId: string): Promise<UserWithRelations> {
  try {
    const existingUser = await getUserWithRelationsById(authUserId);

    if (existingUser) {
      return existingUser;
    }

    return await createUserWithDefaults(authUserId);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return await createUserWithDefaults(authUserId);
    }
    console.error(`Error in findOrCreateUser for auth ID ${authUserId}:`, error);
    throw error;
  }
}

export async function updateUserById(
  authUserId: string,
  userData: Partial<Prisma.UserUpdateInput>
): Promise<UserWithRelations> {
  try {
    await assertCurrentUserId(authUserId);

    const updatedUser = await prisma.user.update({
      where: { authId: authUserId },
      data: userData,
      include: { profile: true, config: true },
    });

    return updatedUser;
  } catch (error) {
    console.error(`Error updating user with auth ID ${authUserId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new UserNotFoundError(authUserId);
    }
    throw new UserUpdateError("Failed to update user", error);
  }
}

export async function updateCurrentUser(userData: Partial<Prisma.UserUpdateInput>): Promise<UserWithRelations> {
  try {
    const currentAuthUser = await requireCurrentUser();
    return await updateUserById(currentAuthUser.id, userData);
  } catch (error) {
    console.error("Error updating current user:", error);
    throw error;
  }
}

export async function deleteUserById(authUserId: string): Promise<boolean> {
  try {
    await assertCurrentUserId(authUserId);

    const deletedUser = await prisma.user.delete({
      where: { authId: authUserId },
    });

    return !!deletedUser;
  } catch (error) {
    console.error(`Error deleting user with auth ID ${authUserId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new UserNotFoundError(authUserId);
    }
    throw new UserDeletionError("Failed to delete user", error);
  }
}

export async function deleteCurrentUser(): Promise<boolean> {
  try {
    const currentAuthUser = await requireCurrentUser();
    return await deleteUserById(currentAuthUser.id);
  } catch (error) {
    console.error("Error deleting current user:", error);
    throw error;
  }
}

export async function checkUserExists(authUserId: string): Promise<boolean> {
  try {
    const user = await getUserById(authUserId);
    return !!user;
  } catch (error) {
    console.error(`Error checking if user exists with auth ID ${authUserId}:`, error);
    return false;
  }
}
