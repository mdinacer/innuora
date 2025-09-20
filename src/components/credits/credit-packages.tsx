"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditUXUtils } from "@/lib/credits/credit-config";
import { CREDIT_PACKAGES, formatCredits, formatUSD } from "@/lib/credits/credits-utils";

interface CreditPackagesProps {
  onPurchase?: (packageKey: keyof typeof CREDIT_PACKAGES) => void;
  className?: string;
}

export function CreditPackages({ onPurchase, className = "" }: CreditPackagesProps) {
  const packages = Object.entries(CREDIT_PACKAGES) as [
    keyof typeof CREDIT_PACKAGES,
    (typeof CREDIT_PACKAGES)[keyof typeof CREDIT_PACKAGES],
  ][];

  const getPackageTimeFrame = (credits: number): string => {
    const weeks = CreditUXUtils.creditsToEstimatedWeeks(credits);
    const days = CreditUXUtils.creditsToEstimatedDays(credits);

    if (weeks >= 4) {
      return `${weeks} weeks of support`;
    } else if (weeks >= 1) {
      return `${weeks} week${weeks > 1 ? "s" : ""} of support`;
    } else {
      return `${days} days of support`;
    }
  };

  const getPackageTitle = (key: string, credits: number): string => {
    const timeFrame = getPackageTimeFrame(credits);
    return `${formatUSD(CREDIT_PACKAGES[key as keyof typeof CREDIT_PACKAGES].price)} Pack — ${timeFrame}`;
  };

  return (
    <div className={`grid md:grid-cols-3 gap-4 ${className}`}>
      {packages.map(([key, pkg]) => (
        <Card key={key} className={`relative ${key === "regular" ? "border-mir-bg-accent shadow-lg" : ""}`}>
          {key === "regular" && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-mir-bg-accent">Most Popular</Badge>
          )}

          <CardHeader className="text-center">
            <CardTitle className="text-lg">{getPackageTitle(key, pkg.credits)}</CardTitle>
            <div className="text-sm text-gray-600 mt-2">{pkg.description}</div>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-lg font-semibold">~{formatCredits(pkg.credits)} credits</div>
              <div className="text-sm text-gray-600">automatically applied</div>
              {pkg.bonus > 0 && <div className="text-sm text-green-600">+{formatCredits(pkg.bonus)} bonus credits</div>}
            </div>

            <Button
              onClick={() => onPurchase?.(key)}
              className={`w-full ${key === "regular" ? "bg-mir-bg-accent hover:bg-mir-bg-accent/90" : ""}`}
              variant={key === "regular" ? "default" : "outline"}
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
    </div>
  );
}

export default CreditPackages;
