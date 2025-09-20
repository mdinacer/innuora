"use client";

import { useEffect, useState } from "react";

import { getUserCreditsBalance } from "@/app/actions/credit-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditUtils, CreditUXUtils } from "@/lib/credits/credit-config";
import { creditsToUSD, formatUSD } from "@/lib/credits/credits-utils";

interface CreditsBalanceProps {
  userId: string;
  className?: string;
  showUSDValue?: boolean;
}

export function CreditsBalance({ userId, className = "", showUSDValue = false }: CreditsBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBalance() {
      try {
        setIsLoading(true);
        setError(null);
        const currentBalance = await getUserCreditsBalance(userId);
        setBalance(currentBalance);
      } catch (err) {
        console.error("Failed to load credits balance:", err);
        setError("Failed to load balance");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      loadBalance();
    }
  }, [userId]);

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

  const usdValue = creditsToUSD(balance || 0);
  const balanceText = CreditUXUtils.getBalanceDisplayText(balance || 0);
  const [mainText, subText] = balanceText.split("\n");

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
