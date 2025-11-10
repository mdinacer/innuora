"use client";

import React, { useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { BILLING_PRODUCTS, BillingProductKey } from "@/lib/billing/billing-config";
import { formatCredits } from "@/lib/credits/credits-utils";
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
  const { trackConversion, trackAction, trackBusiness } = useAnalytics();

  const packages = useMemo(
    () =>
      Object.entries(BILLING_PRODUCTS) as [
        keyof typeof BILLING_PRODUCTS,
        (typeof BILLING_PRODUCTS)[keyof typeof BILLING_PRODUCTS],
      ][],
    []
  );

  // TODO: Use this function for dynamic package titles
  // const getPackageTitle = useCallback(
  //   (key: string, credits: number): string => {
  //     const timeFrame = getPackageTimeFrame(credits);
  //     return `${formatUSD(BILLING_PRODUCTS[key as keyof typeof BILLING_PRODUCTS].price)} Pack - ${timeFrame}`;
  //   },
  //   [getPackageTimeFrame]
  // );

  const handlePurchaseClick = useCallback(
    (key: BillingProductKey) => {
      const packageInfo = BILLING_PRODUCTS[key];

      // Track purchase intent for business analytics
      trackAction("purchase_intent", {
        userId,
        metadata: {
          package: key,
          credits: packageInfo.credits,
          price: packageInfo.price,
          isPopular: packageInfo.popular || false,
        },
      });

      if (userId) {
        setSelectedProduct(key);
        setIsPaymentModalOpen(true);
      } else {
        // Fallback to custom onPurchase handler if no userId provided
        onPurchase?.(key);
      }
    },
    [userId, onPurchase, trackAction]
  );

  const handlePaymentSuccess = useCallback(
    (result: { creditsAdded: number; newBalance: number }) => {
      setIsPaymentModalOpen(false);
      setSelectedProduct(null);

      // Track successful purchase conversion
      if (selectedProduct) {
        const packageInfo = BILLING_PRODUCTS[selectedProduct];

        trackConversion("purchase", {
          userId,
          creditsAmount: result.creditsAdded,
          metadata: {
            package: selectedProduct,
            credits: packageInfo.credits,
            price: packageInfo.price,
            newBalance: result.newBalance,
            isPopular: packageInfo.popular || false,
          },
        });

        // Track business revenue metrics
        trackBusiness("revenue", packageInfo.price, {
          userId,
          metadata: {
            package: selectedProduct,
            credits: packageInfo.credits,
            priceUSD: packageInfo.price,
          },
        });
      }

      onPurchaseSuccess?.(result);
    },
    [onPurchaseSuccess, selectedProduct, userId, trackConversion, trackBusiness]
  );

  return (
    <div data-testid="credit-packages" className={`grid md:grid-cols-3 gap-4 ${className}`}>
      {packages.map(([key, pkg]) => (
        <Card key={key} className={`relative ${pkg.popular ? "border-primary shadow-lg" : ""}`}>
          {pkg.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
          )}

          <CardHeader className="text-center">
            <CardTitle className="text-lg">{pkg.label}</CardTitle>
            <div className="text-sm text-gray-600 mt-2">{pkg.tagline}</div>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-lg font-semibold">{formatCredits(pkg.credits)} credits</div>
              <div className="text-sm text-gray-600">automatically applied</div>
            </div>

            <div>
              <div className="text-xl font-bold">${pkg.price.toFixed(2)}</div>
              <div className="text-xs text-gray-500">one-time purchase</div>
            </div>

            <Button
              onClick={() => handlePurchaseClick(key as BillingProductKey)}
              className={`w-full ${pkg.popular ? "bg-primary hover:bg-primary/90" : ""}`}
              variant={pkg.popular ? "default" : "outline"}
            >
              Purchase {pkg.label}
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="md:col-span-3 text-center text-xs text-gray-500 mt-4">
        *Credit usage varies based on conversation length and depth. Credits never expire.
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
