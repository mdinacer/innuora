/**
 * Optimized Transaction Query Helpers
 *
 * Provides efficient database queries for credit transactions,
 * avoiding in-memory filtering of large datasets.
 */

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PaymentCreditMetadataSchema, validateMetadata } from "@/lib/zod/metadata.schema";

/**
 * Find a purchase transaction by payment intent ID
 * Uses raw SQL for efficient JSON field querying
 */
export async function findPurchaseTransactionByPaymentIntent(
  paymentIntentId: string
): Promise<Prisma.CreditTransactionGetPayload<object> | null> {
  try {
    // Use raw SQL query for efficient JSON field search
    // PostgreSQL supports JSON operators for efficient querying
    const transactions = await prisma.$queryRaw<Array<Prisma.CreditTransactionGetPayload<object>>>`
      SELECT * FROM "CreditTransaction"
      WHERE reason = 'credit_purchase'
      AND metadata->>'paymentIntentId' = ${paymentIntentId}
      LIMIT 1
    `;

    return transactions.length > 0 ? transactions[0] : null;
  } catch (error) {
    // Fallback to in-memory filtering if raw query fails
    console.warn("Raw query failed, falling back to in-memory filtering:", error);
    const purchaseTransactions = await prisma.creditTransaction.findMany({
      where: {
        reason: "credit_purchase",
      },
      take: 1000, // Limit to prevent memory issues
    });

    return (
      purchaseTransactions.find((tx) => {
        const metadata = validateMetadata(PaymentCreditMetadataSchema, tx.metadata);
        return metadata?.paymentIntentId === paymentIntentId;
      }) || null
    );
  }
}

/**
 * Find purchase transactions by payment intent IDs (batch query)
 */
export async function findPurchaseTransactionsByPaymentIntents(
  paymentIntentIds: string[]
): Promise<Array<Prisma.CreditTransactionGetPayload<object>>> {
  if (paymentIntentIds.length === 0) return [];

  try {
    // Use raw SQL query for batch lookup
    const transactions = await prisma.$queryRaw<Array<Prisma.CreditTransactionGetPayload<object>>>`
      SELECT * FROM "CreditTransaction"
      WHERE reason = 'credit_purchase'
      AND metadata->>'paymentIntentId' = ANY(${paymentIntentIds})
    `;

    return transactions;
  } catch (error) {
    // Fallback to in-memory filtering
    console.warn("Batch raw query failed, falling back to in-memory filtering:", error);
    const purchaseTransactions = await prisma.creditTransaction.findMany({
      where: {
        reason: "credit_purchase",
      },
      take: 5000, // Limit for safety
    });

    return purchaseTransactions.filter((tx) => {
      const metadata = validateMetadata(PaymentCreditMetadataSchema, tx.metadata);
      return paymentIntentIds.includes(metadata?.paymentIntentId || "");
    });
  }
}

/**
 * Count purchase transactions by status
 * Useful for analytics and monitoring
 */
export async function countPurchaseTransactionsByStatus(status: "pending" | "completed" | "failed"): Promise<number> {
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "CreditTransaction"
      WHERE reason = 'credit_purchase'
      AND metadata->>'status' = ${status}
    `;

    return Number(result[0]?.count || 0);
  } catch (error) {
    console.warn("Count query failed:", error);
    return 0;
  }
}
