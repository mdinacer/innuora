"use client";

import { useState } from "react";
import { Bell, CreditCard, Database, Lock, Monitor, Settings as SettingsIcon, Shield, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import BillingManagement from "@/components/billing/billing-management";
// Settings sections components (we'll create these)
import AppearanceSettings from "@/components/settings/sections/appearance-settings";
import DataSettings from "@/components/settings/sections/data-settings";
import NotificationSettings from "@/components/settings/sections/notification-settings";
import PrivacySettings from "@/components/settings/sections/privacy-settings";
import ProfileSettings from "@/components/settings/sections/profile-settings";
import SecuritySettings from "@/components/settings/sections/security-settings";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppUserStore } from "@/stores/app-user.store";
import { UserWithRelations } from "@/types/user.types";

// =========================
// Types
// =========================

// interface SettingsPageProps {}

type SettingsSection = {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: // | React.ComponentType<SettingsPageProps>
  React.ComponentType<Record<string, never>> | ((props: { user: UserWithRelations }) => React.ReactElement);
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
    component: () => <BillingManagement />,
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

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const { i18n, t } = useTranslation();
  const user = useAppUserStore((state) => state.user);

  return (
    <div className="max-w-6xl mx-auto rtl:font-arabic-body rtl:space-x-reverse">
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
      <Tabs
        value={activeSection}
        onValueChange={setActiveSection}
        className="flex gap-8 sm:flex-row rtl:sm:flex-row-reverse"
      >
        {/* Sidebar Navigation */}
        <div className="sm:w-64 w-full flex-shrink-0">
          <Select onValueChange={(value) => setActiveSection(value)} defaultValue={activeSection}>
            <SelectTrigger className="w-full sm:hidden">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent className="bg-inn-bg-card">
              <SelectGroup>
                <SelectLabel>Sections</SelectLabel>
                {settingsSections.map((section) => (
                  <SelectItem
                    key={section.id}
                    value={section.id}
                    className="focus:bg-inn-bg-accent focus:text-inn-text-primary"
                  >
                    {section.icon}
                    {section.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <TabsList dir={i18n.dir()} className="sm:flex  flex-col h-auto w-full bg-transparent p-0 space-y-1 hidden">
            {settingsSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="w-full justify-start px-4 py-3 text-left data-[state=active]:bg-inn-bg-accent dark:data-[state=active]:bg-inn-bg-accent data-[state=active]:text-blue-700 data-[state=active]:border-r-2 data-[state=active]:border-blue-600 hover:bg-inn-bg-accent-dark hover:text-white dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3 w-full">
                  {section.icon}
                  <span className="font-medium rtl:font-arabic-body">
                    {t(section.id, { ns: "pages", keyPrefix: "settings.sections" })}
                  </span>
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
              <TabsContent dir={i18n.dir()} key={section.id} value={section.id} className="mt-0">
                <div className="bg-inn-bg-card rounded-lg border border-inn-border-light p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      {section.icon}
                      <h2 className="text-xl font-semibold ">
                        {t(section.id, { ns: "pages", keyPrefix: "settings.sections" })}
                      </h2>
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
                    <SectionComponent {...({ user } as any)} />
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
