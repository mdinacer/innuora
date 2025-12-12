"use client";

import React, { useCallback, useMemo, useState } from "react";

import { useAnalytics } from "@/lib/analytics/use-analytics";
import { BILLING_PRODUCTS, BillingProduct, BillingProductKey } from "@/lib/billing/billing-config";
import { formatCredits } from "@/lib/credits/credits-utils";
import { cn } from "@/lib/utils";
import PaymentModal from "../billing/payment-modal";

interface PackageCardProps {
  className?: string;
  product: BillingProduct;
  onPurchase?: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ className, product, onPurchase }) => {
  const isPremium = product.label.toLowerCase() === "premium";

  return (
    <div
      className={cn(
        "rounded-2xl   bg-card p-6 shadow-lg hover:shadow-xl relative",
        product.popular ? "border-2 border-primary" : "border border-border",
        "hover:-translate-y-1 transition-all duration-300 ease-in-out",
        className
      )}
    >
      {product.popular && (
        <div
          className={cn(
            "popular-badge",
            "absolute -top-3 right-5 bg-accent text-white rounded-2xl text-xs py-1 px-3 font-semibold shadow-2xl"
          )}
        >
          POPULAR
        </div>
      )}
      <div className="text-center mb-4">
        <div className={cn("text-sm font-semibold mb-2", isPremium ? "text-accent" : "text-primary")}>
          {product.label}
        </div>
        <div className="text-sm text-muted-foreground mb-4 ">{product.tagline}</div>
        <div className="text-4xl font-extrabold mb-1">
          {formatCredits(product.credits)} <span className="text-sm text-muted-foreground">credits</span>
        </div>
      </div>
      <div className="text-center mb-6">
        <div className="text-3xl font-bold mb-1">${product.price.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">one-time purchase</div>
      </div>
      <button
        type="button"
        onClick={onPurchase}
        className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white hover:translate-y-[-2px] transition shadow-xl"
      >
        Purchase
      </button>
    </div>
  );
};

interface Props {
  userId?: string;
  userEmail?: string;
  userName?: string;
  onPurchase?: (packageKey: BillingProductKey) => void;
  onPurchaseSuccess?: (result: { creditsAdded: number; newBalance: number }) => void;
  className?: string;
}

const BillingCreditsPackages: React.FC<Props> = ({ userId, userEmail, userName, onPurchase, onPurchaseSuccess }) => {
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
    <div id="tab-purchase" className="tab-content ">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Secure Your Therapeutic Support</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose a credit package that fits your needs. All packages provide uninterrupted access to AI-powered
          therapeutic conversations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {packages.map(([key, packageInfo]) => (
          <PackageCard
            key={key}
            product={packageInfo}
            onPurchase={() => handlePurchaseClick(key as BillingProductKey)}
          />
        ))}
      </div>

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
};

export default BillingCreditsPackages;
