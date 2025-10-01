"use server";

import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action-result";

export interface UserConfigData {
  autoSave: boolean;
  theme: "light" | "dark" | "system" | null;
  locale: string | null;
  fontSize: string | null;
  enableAnimation: boolean;
  analyticsOptIn: boolean;
  shareImprovements: boolean;
  marketingEmails: boolean;
}

/**
 * Get user configuration from database
 */
export async function getUserConfig(): Promise<ActionResult<UserConfigData | null>> {
  return await logger.wrapOperation(
    async () => {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null; // Return null for unauthenticated users instead of throwing
      }

      // Get user's database ID
      const dbUser = await prisma.user.findUnique({
        where: { authId: user!.id },
        select: { id: true },
      });

      if (!dbUser) {
        return null;
      }

      // Get user config
      const config = await prisma.userConfig.findUnique({
        where: { userId: dbUser.id },
      });

      if (!config) {
        return null;
      }

      return {
        autoSave: config.autoSave,
        theme: config.theme as "light" | "dark" | "system" | null,
        locale: config.locale,
        fontSize: config.fontSize,
        enableAnimation: config.enableAnimation,
        analyticsOptIn: config.analyticsOptIn,
        shareImprovements: config.shareImprovements,
        marketingEmails: config.marketingEmails,
      };
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "get_user_config",
    },
    "User config retrieved successfully"
  );
}

/**
 * Update user configuration in database
 */
export async function updateUserConfig(updates: Partial<UserConfigData>): Promise<ActionResult<UserConfigData>> {
  return await logger.wrapOperation(
    async () => {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        logger.logErrorAndThrow(ERROR_CODES.AUTH_UNAUTHORIZED, new Error("User not authenticated"), {
          operation: "update_user_config",
          metadata: { error: error?.message },
        });
      }

      // Get user's database ID
      const dbUser = await prisma.user.findUnique({
        where: { authId: user!.id },
        select: { id: true },
      });

      if (!dbUser) {
        logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error("User not found in database"), {
          operation: "update_user_config",
          userId: user!.id,
        });
      }

      // Update or create user config
      const updatedConfig = await prisma.userConfig.upsert({
        where: { userId: dbUser!.id },
        update: updates,
        create: {
          userId: dbUser!.id,
          ...updates,
        },
      });

      return {
        autoSave: updatedConfig.autoSave,
        theme: updatedConfig.theme as "light" | "dark" | "system" | null,
        locale: updatedConfig.locale,
        fontSize: updatedConfig.fontSize,
        enableAnimation: updatedConfig.enableAnimation,
        analyticsOptIn: updatedConfig.analyticsOptIn,
        shareImprovements: updatedConfig.shareImprovements,
        marketingEmails: updatedConfig.marketingEmails,
      };
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "update_user_config",
    },
    "User config updated successfully"
  );
}

/**
 * Update appearance settings specifically
 */
export async function updateAppearanceSettings(appearance: {
  theme?: "light" | "dark" | "system";
  fontSize?: "small" | "medium" | "large";
  enableAnimation?: boolean;
}): Promise<ActionResult<UserConfigData>> {
  return updateUserConfig(appearance);
}
