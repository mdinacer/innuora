import { Metadata } from "next";

import BillingManagement from "@/components/billing/billing-management";
import { createClient } from "@/lib/supabase/server";

// =========================
// Metadata
// =========================

export const metadata: Metadata = {
  title: "Billing & Credits | Mirael",
  description: "Manage your credits, view purchase history, and secure ongoing therapeutic support.",
};

// =========================
// Billing Page Component
// =========================

export default async function BillingPage() {
  // Get user information
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should be handled by middleware, but just in case
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to view your billing information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BillingManagement
        userId={user.id}
        userEmail={user.email}
        userName={user.user_metadata?.name || user.user_metadata?.full_name}
      />
    </div>
  );
}
