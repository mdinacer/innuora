"use client";

import { useState } from "react";
import { Bell, CreditCard, Database, Lock, Monitor, Settings as SettingsIcon, Shield, User } from "lucide-react";

import BillingManagement from "@/components/billing/billing-management";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Settings sections components (we'll create these)
import AppearanceSettings from "./sections/appearance-settings";
import DataSettings from "./sections/data-settings";
import NotificationSettings from "./sections/notification-settings";
import PrivacySettings from "./sections/privacy-settings";
import ProfileSettings from "./sections/profile-settings";
import SecuritySettings from "./sections/security-settings";

// =========================
// Types
// =========================

interface SettingsPageProps {
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
}

type SettingsSection = {
  id: string;
  label: string;
  icon: React.ReactNode;
  component:
    | React.ComponentType<SettingsPageProps>
    | React.ComponentType<Record<string, never>>
    | ((props: SettingsPageProps) => React.ReactElement);
  badge?: string;
  requiresProps?: boolean;
};

// =========================
// Settings Sections Configuration
// =========================

const settingsSections: SettingsSection[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <User className="h-4 w-4" />,
    component: ProfileSettings,
    requiresProps: true,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <Monitor className="h-4 w-4" />,
    component: AppearanceSettings,
    requiresProps: false,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
    component: NotificationSettings,
    requiresProps: false,
  },
  {
    id: "privacy",
    label: "Privacy & Safety",
    icon: <Shield className="h-4 w-4" />,
    component: PrivacySettings,
    requiresProps: false,
  },
  {
    id: "security",
    label: "Security",
    icon: <Lock className="h-4 w-4" />,
    component: SecuritySettings,
    requiresProps: false,
  },
  {
    id: "billing",
    label: "Billing & Credits",
    icon: <CreditCard className="h-4 w-4" />,
    component: ({ userId, userEmail, userName }: SettingsPageProps) => (
      <BillingManagement userId={userId} userEmail={userEmail || undefined} userName={userName || undefined} />
    ),
    requiresProps: true,
  },
  {
    id: "data",
    label: "Data & Storage",
    icon: <Database className="h-4 w-4" />,
    component: DataSettings,
    badge: "New",
    requiresProps: false,
  },
];

// =========================
// Main Settings Page Component
// =========================

export default function SettingsPage({ userId, userEmail, userName }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">
          Manage your account preferences, privacy settings, and application configuration.
        </p>
      </div>

      {/* Settings Navigation and Content */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1">
            {settingsSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="w-full justify-start px-4 py-3 text-left data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-blue-600 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 w-full">
                  {section.icon}
                  <span className="font-medium">{section.label}</span>
                  {section.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {section.badge}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {settingsSections.map((section) => {
            const SectionComponent = section.component;
            return (
              <TabsContent key={section.id} value={section.id} className="mt-0">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      {section.icon}
                      <h2 className="text-xl font-semibold text-gray-900">{section.label}</h2>
                      {section.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {section.badge}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {section.requiresProps === false ? (
                    <SectionComponent {...({} as any)} />
                  ) : (
                    <SectionComponent {...({ userId, userEmail, userName } as any)} />
                  )}
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
