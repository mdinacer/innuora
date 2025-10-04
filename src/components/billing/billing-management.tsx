"use client";

import { useState } from "react";
import { CreditCard, History, Package, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/lib/logging/unified-logger";
import { useAppUserStore } from "@/stores/app-user.store";
import CreditPackages from "../credits/credit-packages";
import CreditsBalance from "../credits/credits-balance";
import PurchaseHistory from "./purchase-history";

// =========================
// Types
// =========================

// =========================
// Billing Overview Component
// =========================

function BillingOverview() {
  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreditsBalance showUSDValue={true} />

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">How Credits Work</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Credits are used for AI conversations and therapeutic sessions</li>
              <li>• Typical conversation costs 15-35 credits depending on complexity</li>
              <li>• Credits never expire and roll over indefinitely</li>
              <li>• All payments are secure and processed by Stripe</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Secure</div>
              <div className="text-sm text-gray-600">Payment Processing</div>
              <div className="text-xs text-gray-500 mt-1">256-bit SSL encryption</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
              <div className="text-xs text-gray-500 mt-1">Always here to help</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// =========================
// Main Billing Management Component
// =========================

interface BillingManagementProps {
  className?: string;
}

export function BillingManagement({ className = "" }: BillingManagementProps = {}) {
  const [activeTab, setActiveTab] = useState("overview");

  // Get user info from store
  const user = useAppUserStore((state) => state.user);
  const authUser = useAppUserStore((state) => state.authUser);

  const userId = user?.id || "";
  const userEmail = authUser?.email || "";
  const userName = user?.profile?.displayName || "";

  const handlePurchaseSuccess = (result: { creditsAdded: number; newBalance: number }) => {
    // Optionally show a success notification
    logger.logSuccess("Credit package purchase completed successfully", {
      operation: "billing_purchase_success",
      userId,
      metadata: {
        creditsAdded: result.creditsAdded,
        newBalance: result.newBalance,
      },
    });

    // Switch to overview tab to show updated balance
    setActiveTab("overview");
  };

  return (
    <>
      <div className={` w-full max-w-4xl mx-auto ${className}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Billing & Credits</h1>
          <p className="text-gray-600">
            Manage your credits, view purchase history, and secure ongoing therapeutic support.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Buy Credits</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <BillingOverview />
          </TabsContent>

          <TabsContent value="purchase" className="mt-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Secure Your Therapeutic Support</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose a credit package that fits your needs. All packages provide uninterrupted access to AI-powered
                  therapeutic conversations.
                </p>
              </div>

              <CreditPackages
                userId={userId}
                userEmail={userEmail}
                userName={userName}
                onPurchaseSuccess={handlePurchaseSuccess}
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <PurchaseHistory limit={20} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Payment Security</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Your payment information is secured by Stripe, a PCI-compliant payment processor trusted by
                      millions of businesses worldwide.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      SSL Encrypted
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Credit Policy</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Credits never expire</li>
                      <li>• Refunds available within 30 days of purchase</li>
                      <li>• All transactions are recorded for your security</li>
                      <li>• Unused credits carry over indefinitely</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Support</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Need help with billing or have questions about your credits?
                    </p>
                    <Button variant="outline" size="sm">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export default BillingManagement;
