"use client";

import { useState } from "react";
import { CheckIcon, CreditCardIcon, Loader2Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePoints, usePurchasePackages } from "@/lib/points/simple-points";

interface PurchasePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendedPackageId?: string;
}

/**
 * Modal for purchasing points packages
 */
export function PurchasePointsModal({ isOpen, onClose, recommendedPackageId }: PurchasePointsModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>(recommendedPackageId || "essential");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string } | null>(null);

  const { purchasePoints, getBalanceUSD } = usePoints();
  const { packages, formatPackageValue } = usePurchasePackages();

  const handlePurchase = async () => {
    if (!selectedPackageId) return;

    setIsProcessing(true);
    setPurchaseResult(null);

    try {
      const result = await purchasePoints(selectedPackageId);

      if (result.success) {
        setPurchaseResult({
          success: true,
          message: `Successfully added ${formatPackageValue(selectedPackageId).total} to your account!`,
        });
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
          setPurchaseResult(null);
        }, 2000);
      } else {
        setPurchaseResult({
          success: false,
          message: result.error || "Purchase failed. Please try again.",
        });
      }
    } catch (error) {
      setPurchaseResult({
        success: false,
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl bg-mir-bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-5 text-mir-bg-accent" />
            Purchase Points
          </DialogTitle>
          <DialogDescription>
            Choose a package to add points to your account. Current balance: {getBalanceUSD()}
          </DialogDescription>
        </DialogHeader>

        {/* Purchase Result */}
        {purchaseResult && (
          <div
            className={`p-3 rounded-lg ${purchaseResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <div className="flex items-center gap-2">
              {purchaseResult.success ? (
                <CheckIcon className="size-4 text-green-600" />
              ) : (
                <span className="text-red-600">⚠️</span>
              )}
              <span className={`text-sm font-medium ${purchaseResult.success ? "text-green-800" : "text-red-800"}`}>
                {purchaseResult.message}
              </span>
            </div>
          </div>
        )}

        {/* Package Selection */}
        <div className="space-y-3">
          {packages.map((pkg) => {
            const packageValue = formatPackageValue(pkg.id);
            const isSelected = selectedPackageId === pkg.id;
            const isPopular = pkg.isPopular;

            return (
              <div
                key={pkg.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-mir-bg-accent bg-mir-bg-accent/5"
                    : "border-mir-border-light hover:border-mir-bg-accent/50"
                }`}
                onClick={() => setSelectedPackageId(pkg.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPackageId(pkg.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
              >
                {isPopular && (
                  <div className="absolute -top-2 left-4 px-2 py-1 bg-mir-bg-accent text-white text-xs font-semibold rounded">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-mir-text-primary">{pkg.name}</h3>
                    <p className="text-sm text-mir-text-secondary mt-1">{pkg.description}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-medium">{packageValue.base}</span>
                      {packageValue.bonus && (
                        <span className="text-mir-bg-accent font-medium">{packageValue.bonus} bonus</span>
                      )}
                      <span className="text-sm text-mir-text-secondary">= {packageValue.total}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-mir-text-primary">{packageValue.price}</div>
                    {isSelected && <CheckIcon className="size-5 text-mir-bg-accent mx-auto mt-1" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg border border-mir-border-light bg-mir-bg-card text-mir-text-primary hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isProcessing || !selectedPackageId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-mir-bg-accent text-white hover:bg-mir-bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isProcessing && <Loader2Icon className="size-4 animate-spin" />}
            {isProcessing ? "Processing..." : `Purchase ${formatPackageValue(selectedPackageId).price}`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
