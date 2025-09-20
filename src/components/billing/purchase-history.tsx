"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Clock, Receipt, RefreshCw, XCircle } from "lucide-react";

import { getUserPurchaseHistory } from "@/app/actions/billing-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BillingUtils } from "@/lib/billing/billing-config";

// =========================
// Types
// =========================

interface Purchase {
  id: string;
  amount: number;
  credits: number;
  date: Date;
  status: string;
  paymentIntentId?: string;
}

interface PurchaseHistoryProps {
  userId: string;
  className?: string;
  limit?: number;
}

// =========================
// Purchase History Component
// =========================

export function PurchaseHistory({ userId, className = "", limit = 10 }: PurchaseHistoryProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPurchaseHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getUserPurchaseHistory(userId, limit);

      if (result.success && result.purchases) {
        setPurchases(result.purchases);
      } else {
        setError(result.error || "Failed to load purchase history");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Purchase history loading error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadPurchaseHistory();
    }
  }, [userId, limit]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPurchaseHistory();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "succeeded":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "succeeded":
        return "text-green-600";
      case "pending":
      case "processing":
        return "text-yellow-600";
      case "failed":
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Purchase History
          </CardTitle>
          <Button onClick={handleRefresh} variant="ghost" size="sm" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No purchases yet</p>
            <p className="text-sm text-gray-400">
              Your credit purchases will appear here once you make your first purchase.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(purchase.status)}

                  <div>
                    <div className="font-medium">{purchase.credits.toLocaleString()} credits purchased</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(purchase.date), "MMM d, yyyy • h:mm a")}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {BillingUtils.formatAmount(BillingUtils.dollarsToCents(purchase.amount))}
                  </div>
                  <div className={`text-sm ${getStatusColor(purchase.status)}`}>{formatStatus(purchase.status)}</div>
                </div>
              </div>
            ))}

            {purchases.length === limit && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">Showing recent {limit} purchases</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PurchaseHistory;
