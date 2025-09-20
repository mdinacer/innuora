// Migration utilities for upgrading to new credit system
"use server";

import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { AI_MODEL_PRICING_USD, calculateCreditsFromTokens } from "./credits-utils";

/**
 * Migrate existing user balances to new credit system
 * Doubles credit balances since new credit value is half (0.5¢ vs 1¢)
 */
export async function migrateUserCreditBalances(): Promise<{
  success: boolean;
  usersUpdated: number;
  totalCreditsAdded: number;
}> {
  return await logger.wrapOperation(
    async () => {
      const result = await prisma.$transaction(async (tx) => {
        // Get all users with positive balances
        const usersWithBalances = await tx.user.findMany({
          where: { creditsBalance: { gt: 0 } },
          select: { id: true, creditsBalance: true },
        });

        let totalCreditsAdded = 0;

        // Double each user's balance
        for (const user of usersWithBalances) {
          const newBalance = user.creditsBalance * 2;
          const creditsAdded = user.creditsBalance;

          await tx.user.update({
            where: { id: user.id },
            data: { creditsBalance: newBalance },
          });

          // Create migration transaction record
          await (tx as any).creditTransaction.create({
            data: {
              userId: user.id,
              type: "CREDIT",
              amount: creditsAdded,
              reason: "pricing_migration",
              metadata: {
                migrationType: "balance_doubling",
                oldBalance: user.creditsBalance,
                newBalance: newBalance,
                migrationDate: new Date().toISOString(),
              },
            },
          });

          totalCreditsAdded += creditsAdded;
        }

        return {
          usersUpdated: usersWithBalances.length,
          totalCreditsAdded,
        };
      });

      return {
        success: true,
        ...result,
      };
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "migrate_user_credit_balances",
    },
    "Successfully migrated user credit balances to new pricing system"
  );
}

/**
 * Calculate cost comparison between old and new pricing models
 */
export function calculatePricingComparison(
  inputTokens: number,
  outputTokens: number,
  modelCode: string
): {
  oldCost: number;
  newCost: number;
  savings: number;
  savingsPercent: number;
} {
  // Old pricing (approximate from your previous system)
  const oldPricing = {
    M1: { base: 2, inputMult: 0.0015, outputMult: 0.006 },
    M2: { base: 10, inputMult: 0.025, outputMult: 0.1 },
    M3: { base: 8, inputMult: 0.03, outputMult: 0.15 },
  };

  const oldModel = oldPricing[modelCode as keyof typeof oldPricing];
  const oldCost = oldModel ? oldModel.base + inputTokens * oldModel.inputMult + outputTokens * oldModel.outputMult : 0;

  // Use the actual new pricing model from credits-utils
  const newCost = calculateCreditsFromTokens(modelCode as keyof typeof AI_MODEL_PRICING_USD, inputTokens, outputTokens);

  const savings = Math.max(0, oldCost - newCost);
  const savingsPercent = oldCost > 0 ? (savings / oldCost) * 100 : 0;

  return {
    oldCost,
    newCost,
    savings,
    savingsPercent,
  };
}
