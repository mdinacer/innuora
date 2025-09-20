"use client";

import { useEffect, useState } from "react";

import { estimateAIMessageCost } from "@/app/actions/credit-actions";
import { ModelCode } from "@/domains/ai-conversation/ai-models";
import { CreditUtils } from "@/lib/credits/credit-config";

interface CreditsCostEstimatorProps {
  content: string;
  modelCode: ModelCode;
  onCostUpdate?: (cost: number) => void;
  className?: string;
}

export function CreditsCostEstimator({ content, modelCode, onCostUpdate, className = "" }: CreditsCostEstimatorProps) {
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const calculateCost = async () => {
      if (!content.trim()) {
        setEstimatedCost(0);
        onCostUpdate?.(0);
        return;
      }

      setIsCalculating(true);
      try {
        const cost = await estimateAIMessageCost(content, modelCode as any);
        setEstimatedCost(cost);
        onCostUpdate?.(cost);
      } catch (error) {
        console.error("Failed to estimate cost:", error);
        setEstimatedCost(0);
        onCostUpdate?.(0);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce the calculation
    const timeoutId = setTimeout(calculateCost, 300);
    return () => clearTimeout(timeoutId);
  }, [content, modelCode, onCostUpdate]);

  if (!content.trim() || estimatedCost === 0) {
    return null;
  }

  return (
    <div className={`credits-cost-estimator text-xs text-gray-500 ${className}`}>
      {isCalculating ? (
        <span>Calculating...</span>
      ) : (
        <span>Estimated cost: {CreditUtils.formatCreditsForDisplay(estimatedCost)} credits</span>
      )}
    </div>
  );
}

export default CreditsCostEstimator;
