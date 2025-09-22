"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
// Import proper types from Prisma
import type { CreditTransaction } from "@prisma/client";
import { CreditTransactionType } from "@prisma/client";
import { format } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

import { getUserCreditHistory } from "@/app/actions/credit-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditUtils } from "@/lib/credits/credit-config";
import { logger } from "@/lib/logging/unified-logger";

interface CreditsTransactionHistoryProps {
  userId: string;
  limit?: number;
  className?: string;
}

export function CreditsTransactionHistory({ userId, limit = 20, className = "" }: CreditsTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true);
        setError(null);
        const history = await getUserCreditHistory(userId, limit);
        setTransactions(history);
      } catch (err) {
        logger.logWarning("Failed to load credit transaction history", {
          operation: "credits_transaction_history_load_failed",
          userId,
          metadata: {
            error: err instanceof Error ? err.message : String(err),
          },
        });
        setError("Failed to load transaction history");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      loadTransactions();
    }
  }, [userId, limit]);

  const getTransactionIcon = useCallback((type: CreditTransactionType) => {
    return type === CreditTransactionType.CREDIT ? (
      <ArrowUpCircle className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownCircle className="h-4 w-4 text-red-600" />
    );
  }, []);

  const getTransactionColor = useCallback((type: CreditTransactionType) => {
    return type === CreditTransactionType.CREDIT ? "text-green-600" : "text-red-600";
  }, []);

  const reasonMap = useMemo(
    () => ({
      ai_usage: "AI Message",
      purchase: "Credit Purchase",
      admin_adjustment: "Admin Adjustment",
      bonus: "Bonus Credits",
      refund: "Refund",
    }),
    []
  );

  const formatReason = useCallback(
    (reason: string) => {
      return (
        reasonMap[reason as keyof typeof reasonMap] ||
        reason.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      );
    },
    [reasonMap]
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Credit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Credit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Credit History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No transactions yet</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.type)}

                  <div>
                    <div className="font-medium">{formatReason(transaction.reason)}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(transaction.createdAt), "MMM d, yyyy • h:mm a")}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === CreditTransactionType.CREDIT ? "+" : "-"}
                    {CreditUtils.formatCreditsForDisplay(transaction.amount)} credits
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CreditsTransactionHistory;
