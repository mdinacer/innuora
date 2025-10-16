"use client";

import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { CreditUXUtils } from "@/lib/credits/credit-config";
import { creditsToUSD, formatUSD } from "@/lib/credits/credits-utils";
import { useAppUserStore } from "@/stores/app-user.store";

interface CreditsBalanceProps {
  className?: string;
  showUSDValue?: boolean;
  content?: (props: { currentBalance: number; subText: string; usdValue: string }) => React.ReactNode;
}

export function CreditsBalance({ className = "", showUSDValue = false, content }: CreditsBalanceProps) {
  // Get credits from Zustand store for real-time updates
  const user = useAppUserStore((state) => state.user);
  const hasHydrated = useAppUserStore((state) => state.hasHydrated);

  const balance = user?.creditsBalance ?? 0;

  const { usdValue, mainText, subText } = useMemo(() => {
    const currentBalance = balance;
    const usdValue = creditsToUSD(currentBalance);
    const mainText = `${currentBalance} credits available`;
    const subText = CreditUXUtils.getLowBalanceWarning(currentBalance);

    return { usdValue, mainText, subText };
  }, [balance]);

  // Show skeleton while store is hydrating
  if (!hasHydrated || !user) {
    return (
      <div className={`credits-balance ${className}`}>
        <Skeleton className="h-6 w-24" />
        {showUSDValue && <Skeleton className="h-4 w-16 mt-1" />}
      </div>
    );
  }

  if (content) {
    return content({
      currentBalance: balance,
      subText: CreditUXUtils.getLowBalanceWarning(balance),
      usdValue: formatUSD(usdValue),
    });
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
