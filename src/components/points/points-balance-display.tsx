"use client";

import { useState } from "react";
import { CoinsIcon, CreditCardIcon } from "lucide-react";

import { usePoints, usePurchasePackages } from "@/lib/points/simple-points";
import { PurchasePointsModal } from "./purchase-points-modal";

interface PointsBalanceDisplayProps {
  className?: string;
  showPurchaseLink?: boolean;
}

/**
 * Display current points balance with optional purchase link
 */
export function PointsBalanceDisplay({ className = "", showPurchaseLink = true }: PointsBalanceDisplayProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { getBalanceUSD, getBalance, isLoading } = usePoints();
  const { getRecommendedPackage } = usePurchasePackages();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <CoinsIcon className="size-4 text-mir-bg-accent" />
          <span className="text-sm text-mir-text-secondary">Loading...</span>
        </div>
      </div>
    );
  }

  const balance = getBalance();
  const balanceUSD = getBalanceUSD();
  const isLowBalance = balance < 100; // Less than $1.00
  const recommendedPackage = getRecommendedPackage();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Balance Display */}
      <div className="flex items-center gap-2">
        <CoinsIcon className={`size-4 ${isLowBalance ? "text-orange-500" : "text-mir-bg-accent"}`} />
        <span className={`text-sm font-medium ${isLowBalance ? "text-orange-600" : "text-mir-text-primary"}`}>
          {balanceUSD}
        </span>
      </div>

      {/* Low Balance Warning */}
      {isLowBalance && <span className="text-xs text-orange-600 font-medium">Low Balance</span>}

      {/* Purchase Link */}
      {showPurchaseLink && isLowBalance && (
        <button
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-mir-bg-accent text-white hover:bg-mir-bg-accent/90 transition-colors"
          onClick={() => setShowPurchaseModal(true)}
        >
          <CreditCardIcon className="size-3" />
          Add Points
        </button>
      )}

      {/* Purchase Modal */}
      <PurchasePointsModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        recommendedPackageId={undefined}
      />
    </div>
  );
}

/**
 * Compact version for header/navigation use
 */
export function PointsBalanceCompact({ className = "" }: { className?: string }) {
  return <PointsBalanceDisplay className={`${className}`} showPurchaseLink={false} />;
}

/**
 * Full version with purchase options for session pages
 */
export function PointsBalanceFull({ className = "" }: { className?: string }) {
  return (
    <PointsBalanceDisplay
      className={`p-3 rounded-lg border border-mir-border-light bg-mir-bg-card ${className}`}
      showPurchaseLink={true}
    />
  );
}
