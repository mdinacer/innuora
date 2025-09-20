"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { getUserCreditsBalance } from "@/app/actions/credit-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CreditUXUtils } from "@/lib/credits/credit-config";

interface InsufficientCreditsWarningProps {
  required: number;
  available?: number;
  userId?: string;
  onPurchaseClick?: () => void;
  className?: string;
}

export function InsufficientCreditsWarning({
  required,
  available,
  userId,
  onPurchaseClick,
  className = "",
}: InsufficientCreditsWarningProps) {
  const [currentBalance, setCurrentBalance] = useState<number>(available || 0);
  const [isLoading, setIsLoading] = useState<boolean>(!!userId && available === undefined);

  useEffect(() => {
    async function fetchBalance() {
      if (userId && available === undefined) {
        try {
          setIsLoading(true);
          const balance = await getUserCreditsBalance(userId);
          setCurrentBalance(balance);
        } catch (error) {
          console.error("Failed to fetch credits balance:", error);
          setCurrentBalance(0);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchBalance();
  }, [userId, available]);

  const effectiveBalance = available !== undefined ? available : currentBalance;
  const deficit = required - effectiveBalance;

  if (isLoading) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Checking Credits...</AlertTitle>
        <AlertDescription>Please wait while we verify your balance.</AlertDescription>
      </Alert>
    );
  }

  const isLowBalance = CreditUXUtils.isBalanceLow(effectiveBalance);
  const isCriticalBalance = CreditUXUtils.isBalanceCritical(effectiveBalance);
  const warningMessage = CreditUXUtils.getLowBalanceWarning(effectiveBalance);

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{isCriticalBalance ? "Support Interrupted" : "Low Balance"}</AlertTitle>
      <AlertDescription>
        <div className="mb-3 whitespace-pre-line">{warningMessage}</div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onPurchaseClick} className="bg-blue-600 hover:bg-blue-700">
            Secure More Support
          </Button>

          <Button size="sm" variant="outline" onClick={() => window.open("/pricing", "_blank")}>
            View Plans
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default InsufficientCreditsWarning;
