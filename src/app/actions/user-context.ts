"use server";

import { Prisma } from "@prisma/client";

import { requireCurrentUser } from "@/app/actions/auth-actions";
import { UserTier } from "@/lib/billing/tier-config";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";

// Helper to convert Prisma Decimal to number
function toNumber(decimal: Prisma.Decimal | number): number {
  if (typeof decimal === "number") return decimal;
  return decimal.toNumber();
}

/**
 * User data needed for most operations
 * Fetched once per request to avoid multiple DB calls
 */
export interface AuthenticatedUserContext {
  authId: string; // Supabase auth ID
  id: string; // Database user ID
  tier: UserTier;
  creditsBalance: number;
  role: string | null;
}

/**
 * Get authenticated user with all necessary context
 * Call this ONCE at the start of your server action, then pass the result around
 *
 * Performance: Single database query per request
 */
export async function getAuthenticatedUserContext(): Promise<AuthenticatedUserContext> {
  // Step 1: Verify authentication (no DB call - checks session)
  const authUser = await requireCurrentUser();

  // Step 2: Single database lookup with all needed fields
  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
    select: {
      id: true,
      tier: true,
      creditsBalance: true,
      role: true,
    },
  });

  if (!user) {
    logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error("User not found in database"), {
      operation: "get_authenticated_user_context",
      metadata: { authId: authUser.id },
    });
    throw new Error("User not found"); // TypeScript needs this for null check
  }

  return {
    authId: authUser.id,
    id: user.id,
    tier: (user.tier ?? "FREE") as UserTier,
    creditsBalance: toNumber(user.creditsBalance),
    role: user.role,
  };
}

/**
 * Internal helper: Get user by authId (for webhooks, admin actions, etc.)
 * NOT exported to client - only used by other server functions
 */
export async function _getUserByAuthIdInternal(authId: string): Promise<AuthenticatedUserContext> {
  const user = await prisma.user.findUnique({
    where: { authId },
    select: {
      id: true,
      tier: true,
      creditsBalance: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error(`User not found: ${authId}`);
  }

  return {
    authId,
    id: user.id,
    tier: (user.tier ?? "FREE") as UserTier,
    creditsBalance: toNumber(user.creditsBalance),
    role: user.role,
  };
}
