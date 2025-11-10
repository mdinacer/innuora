"use client";

import { useState } from "react";
import { ClipboardClockIcon, CreditCardIcon, DockIcon, InfoIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/lib/logging/logger.client";
import { cn } from "@/lib/utils";
import { useAppUserStore } from "@/stores/app-user.store";
import BillingCreditsPackages from "./billing-credits-packages";
import BillingHelp from "./billing-help";
import BillingOverview from "./billing-overview";
import PurchaseHistory from "./purchase-history";

const TABS = [
  { id: "overview", label: "Overview", icon: DockIcon },
  { id: "purchase", label: "Buy Credits", icon: CreditCardIcon },
  { id: "history", label: "Purchase History", icon: ClipboardClockIcon },
  { id: "info", label: "How It Works", icon: InfoIcon },
];

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
  const addCredits = useAppUserStore((state) => state.addCredits);

  const userId = user?.id || "";
  const userEmail = authUser?.email || "";
  const userName = user?.profile?.displayName || "";

  const handlePurchaseSuccess = (result: { creditsAdded: number; newBalance: number }) => {
    // Update credits in the store (add the purchased credits to current balance)
    addCredits(result.creditsAdded);

    // Log success
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
    <div className={cn("max-w-4xl w-full mx-auto h-full", className)}>
      <div className=" px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Billing & Credits</h1>
        <p className="text-muted-foreground">
          Manage your credits, view purchase history, and secure ongoing therapeutic support.
        </p>
      </div>

      <Tabs className="w-full px-0 sm:px-6 pb-16 gap-y-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent sm:w-auto w-full">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-pre-wrap sm:whitespace-nowrap",
                "data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                "dark:data-[state=active]:text-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none",
                "text-muted-foreground hover:text-foreground",
                "transition-all duration-300 ease-in-out",
                "border-none rounded-none"
              )}
            >
              <tab.icon className="size-[18px]" />
              <span className="sm:inline hidden">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <BillingOverview />
        </TabsContent>
        <TabsContent value="purchase">
          <BillingCreditsPackages
            userId={userId}
            userEmail={userEmail}
            userName={userName}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        </TabsContent>
        <TabsContent value="history">
          <PurchaseHistory limit={10} />
        </TabsContent>
        <TabsContent value="info">
          <BillingHelp />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BillingManagement;
