"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { getUserCreditsBalance } from "@/app/actions/credit-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditUXUtils } from "@/lib/credits/credit-config";
import { creditsToUSD, formatUSD } from "@/lib/credits/credits-utils";
import { logger } from "@/lib/logging/unified-logger";

interface CreditsBalanceProps {
  className?: string;
  showUSDValue?: boolean;
}

export function CreditsBalance({ className = "", showUSDValue = false }: CreditsBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current authenticated user
      const user = await findCurrentUser();
      if (!user) {
        setError("Not authenticated");
        return;
      }

      const result = await getUserCreditsBalance(user.id);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      const currentBalance = result.data;
      logger.logInfo("Credits balance loaded", {
        operation: "credits_balance_loaded",
        metadata: { balance: currentBalance },
      });

      setBalance(currentBalance);
    } catch (err) {
      logger.logWarning("Failed to load credits balance in UI component", {
        operation: "credits_balance_load_failed",
        metadata: {
          error: err instanceof Error ? err.message : String(err),
        },
      });
      setError("Failed to load balance");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const { usdValue, mainText, subText } = useMemo(() => {
    const currentBalance = balance || 0;
    const usdValue = creditsToUSD(currentBalance);
    const balanceText = CreditUXUtils.getBalanceDisplayText(currentBalance);
    const [mainText, subText] = balanceText.split("\n");

    return { usdValue, mainText, subText };
  }, [balance]);

  if (isLoading) {
    return (
      <div className={`credits-balance ${className}`}>
        <Skeleton className="h-6 w-24" />
        {showUSDValue && <Skeleton className="h-4 w-16 mt-1" />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`credits-balance error ${className}`}>
        <span className="text-red-500 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className={`credits-balance ${className}`}>
      <div className="balance-display">
        <span className="text-lg font-semibold">{mainText}</span>
        {subText && <div className="text-sm text-gray-600 mt-1 opacity-80">{subText}</div>}
      </div>

      {showUSDValue && <div className="balance-value text-xs text-gray-500 mt-2">≈ {formatUSD(usdValue)} value</div>}
    </div>
  );
}

export default CreditsBalance;
