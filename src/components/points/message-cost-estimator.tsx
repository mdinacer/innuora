"use client";

import { useEffect, useState } from "react";
import { AlertTriangleIcon, CoinsIcon } from "lucide-react";

import { usePoints } from "@/lib/points/simple-points";
import { cn } from "@/lib/utils";
import { InsufficientPointsInlineWarning } from "./insufficient-points-warning";

interface MessageCostEstimatorProps {
  message: string;
  className?: string;
}

/**
 * Shows the estimated cost of sending a message
 */
export function MessageCostEstimator({ message, className }: MessageCostEstimatorProps) {
  const [estimatedCost, setEstimatedCost] = useState(0);
  const { getServiceCost, getBalance, canAffordService } = usePoints();

  useEffect(() => {
    if (message.trim()) {
      const cost = getServiceCost("basic_message");
      setEstimatedCost(cost);
    } else {
      setEstimatedCost(0);
    }
  }, [message, getServiceCost]);

  if (!message.trim() || estimatedCost === 0) return null;

  const balance = getBalance();
  const canAfford = canAffordService("basic_message");
  const costUSD = `$${(estimatedCost / 100).toFixed(2)}`;

  return (
    <div className={cn("flex items-center justify-between gap-2 text-xs", className)}>
      <div className="flex items-center gap-1 text-mir-text-secondary">
        <CoinsIcon className="size-3" />
        <span>Cost: {costUSD}</span>
      </div>
      {!canAfford && <InsufficientPointsInlineWarning requiredCost={estimatedCost} availableBalance={balance} />}
    </div>
  );
}

/**
 * Shows insufficient balance warning
 */
export function InsufficientBalanceWarning({ cost, balance }: { cost: number; balance: number }) {
  const deficit = cost - balance;
  const deficitUSD = `$${(deficit / 100).toFixed(2)}`;
  const balanceUSD = `$${(balance / 100).toFixed(2)}`;
  const costUSD = `$${(cost / 100).toFixed(2)}`;

  return (
    <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangleIcon className="size-4" />
        <span className="font-medium">Insufficient Points</span>
      </div>
      <p className="text-sm">
        You need {deficitUSD} more points to send this message. Required: {costUSD}, Available: {balanceUSD}
      </p>
    </div>
  );
}
