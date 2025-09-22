"use client";

import { useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BILLING_PRODUCTS, BillingProductKey } from "@/lib/billing/billing-config";
import { CreditUXUtils } from "@/lib/credits/credit-config";
import { formatCredits, formatUSD } from "@/lib/credits/credits-utils";
import PaymentModal from "../billing/payment-modal";

interface CreditPackagesProps {
  userId?: string;
  userEmail?: string;
  userName?: string;
  onPurchase?: (packageKey: BillingProductKey) => void;
  onPurchaseSuccess?: (result: { creditsAdded: number; newBalance: number }) => void;
  className?: string;
}

export function CreditPackages({
  userId,
  userEmail,
  userName,
  onPurchase,
  onPurchaseSuccess,
  className = "",
}: CreditPackagesProps) {
  const [selectedProduct, setSelectedProduct] = useState<BillingProductKey | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const packages = useMemo(
    () =>
      Object.entries(BILLING_PRODUCTS) as [
        keyof typeof BILLING_PRODUCTS,
        (typeof BILLING_PRODUCTS)[keyof typeof BILLING_PRODUCTS],
      ][],
    []
  );

  const getPackageTimeFrame = useCallback((credits: number): string => {
    const weeks = CreditUXUtils.creditsToEstimatedWeeks(credits);
    const days = CreditUXUtils.creditsToEstimatedDays(credits);

    if (weeks >= 4) {
      return `${weeks} weeks of support`;
    } else if (weeks >= 1) {
      return `${weeks} week${weeks > 1 ? "s" : ""} of support`;
    } else {
      return `${days} days of support`;
    }
  }, []);

  const getPackageTitle = useCallback(
    (key: string, credits: number): string => {
      const timeFrame = getPackageTimeFrame(credits);
      return `${formatUSD(BILLING_PRODUCTS[key as keyof typeof BILLING_PRODUCTS].price)} Pack — ${timeFrame}`;
    },
    [getPackageTimeFrame]
  );

  const handlePurchaseClick = useCallback(
    (key: BillingProductKey) => {
      if (userId) {
        setSelectedProduct(key);
        setIsPaymentModalOpen(true);
      } else {
        // Fallback to custom onPurchase handler if no userId provided
        onPurchase?.(key);
      }
    },
    [userId, onPurchase]
  );

  const handlePaymentSuccess = useCallback(
    (result: { creditsAdded: number; newBalance: number }) => {
      setIsPaymentModalOpen(false);
      setSelectedProduct(null);
      onPurchaseSuccess?.(result);
    },
    [onPurchaseSuccess]
  );

  return (
    <div className={`grid md:grid-cols-3 gap-4 ${className}`}>
      {packages.map(([key, pkg]) => (
        <Card key={key} className={`relative ${pkg.popular ? "border-mir-bg-accent shadow-lg" : ""}`}>
          {pkg.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-mir-bg-accent">Most Popular</Badge>
          )}

          <CardHeader className="text-center">
            <CardTitle className="text-lg">{pkg.label}</CardTitle>
            <div className="text-sm text-gray-600 mt-2">{pkg.tagline}</div>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-lg font-semibold">~{formatCredits(pkg.credits)} credits</div>
              <div className="text-sm text-gray-600">automatically applied</div>
            </div>

            <div>
              <div className="text-xl font-bold">${pkg.price.toFixed(2)}</div>
              <div className="text-xs text-gray-500">one-time purchase</div>
            </div>

            <Button
              onClick={() => handlePurchaseClick(key as BillingProductKey)}
              className={`w-full ${pkg.popular ? "bg-mir-bg-accent hover:bg-mir-bg-accent/90" : ""}`}
              variant={pkg.popular ? "default" : "outline"}
            >
              Secure {getPackageTimeFrame(pkg.credits)}
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="md:col-span-3 text-center text-xs text-gray-500 mt-4">
        *Support duration estimated based on typical usage patterns. Actual usage may vary based on conversation
        frequency and depth.
      </div>

      {/* Payment Modal */}
      {selectedProduct && userId && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedProduct(null);
          }}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          productKey={selectedProduct}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default CreditPackages;
