import { Metadata } from "next";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { DynamicPages } from "@/components/dynamic-loaders";
import Header from "@/components/header";
import { APP_CONFIG } from "@/config/app";
import initTranslations from "@/lib/i18n";
import UserMenu from "@/user-menu";

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

export default async function Settings({ params }: { params: Promise<{ locale: string }> }) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["pages/settings"]);

  const accessDeniedContent = t("settings.accessDenied", {
    returnObjects: true,
    defaultValue: {
      title: "Access Denied",
      message: "You do not have permission to view this page.",
    },
  }) as { title: string; message: string };
  // Get user information
  const user = await findCurrentUser();

  if (!user) {
    // This should be handled by middleware, but just in case
    return (
      <div className="container standalone:h-screen-safe w-full flex items-center justify-center h-screen mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{accessDeniedContent.title}</h1>
          <p className="text-gray-600">{accessDeniedContent.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-30">
      <Header className="fixed inset-x-0 top-0 py-1 z-50 shadow-md" sideContent={<UserMenu />} />
      <DynamicPages.SettingsPage />
    </div>
  );
}
