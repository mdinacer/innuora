"use client";

import { useState } from "react";
import { AlertTriangleIcon, CreditCardIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface InsufficientPointsWarningProps {
  requiredCost: number;
  availableBalance: number;
  className?: string;
  message?: string;
}

/**
 * Warning displayed when user doesn't have enough points
 */
export function InsufficientPointsWarning({
  requiredCost,
  availableBalance,
  className,
  message = "You don't have enough points to perform this action.",
}: InsufficientPointsWarningProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  //const { getRecommendedPackage } = usePurchasePackages();

  const deficit = requiredCost - availableBalance;
  const deficitUSD = `$${(deficit / 100).toFixed(2)}`;
  const balanceUSD = `$${(availableBalance / 100).toFixed(2)}`;
  const costUSD = `$${(requiredCost / 100).toFixed(2)}`;
  // const recommendedPackage = getRecommendedPackage();

  return (
    <>
      <div className={cn("p-4 rounded-lg border-l-4 border-orange-400 bg-orange-50 text-orange-800", className)}>
        <div className="flex items-start gap-3">
          <AlertTriangleIcon className="size-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Insufficient Points</h3>
            <p className="text-sm mb-2">{message}</p>
            <div className="text-xs space-y-1 mb-3">
              <div>Required: {costUSD}</div>
              <div>Available: {balanceUSD}</div>
              <div className="font-medium">Need {deficitUSD} more</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <CreditCardIcon className="size-3" />
                Buy Points
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <PurchasePointsModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        recommendedPackageId={recommendedPackage?.id}
      /> */}
    </>
  );
}

/**
 * Compact inline warning for input components
 */
export function InsufficientPointsInlineWarning({
  requiredCost,
  availableBalance,
  className,
}: {
  requiredCost: number;
  availableBalance: number;
  className?: string;
}) {
  const deficit = requiredCost - availableBalance;
  const deficitUSD = `$${(deficit / 100).toFixed(2)}`;

  return (
    <div className={cn("flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded", className)}>
      <AlertTriangleIcon className="size-3" />
      <span>Need {deficitUSD} more points</span>
    </div>
  );
}
