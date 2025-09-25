import { Metadata } from "next";

import { DynamicPages } from "@/components/dynamic-loaders";
import { APP_CONFIG } from "@/config/app";
import { createClient } from "@/lib/supabase/server";

// =========================
// Metadata
// =========================

export const metadata: Metadata = {
  title: `Settings | ${APP_CONFIG.name}`,
  description: "Manage your account settings, privacy preferences, and application configuration.",
};

// =========================
// Settings Page Component
// =========================

export default async function Settings() {
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
          <p className="text-gray-600">Please sign in to access your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DynamicPages.SettingsPage />
    </div>
  );
}
