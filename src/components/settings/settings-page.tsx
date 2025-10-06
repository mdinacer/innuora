"use client";

import { useState } from "react";
import { Database, Lock, Monitor, Settings as SettingsIcon, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

// Settings sections components (we'll create these)
import AppearanceSettings from "@/components/settings/sections/appearance-settings";
import DataSettings from "@/components/settings/sections/data-settings";
import PrivacySettings from "@/components/settings/sections/privacy-settings";
import SecuritySettings from "@/components/settings/sections/security-settings";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAppUserStore } from "@/stores/app-user.store";
import { UserWithRelations } from "@/types/user.types";

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
    id: "appearance",
    label: "Appearance",
    icon: <Monitor className="h-4 w-4" />,
    component: AppearanceSettings,
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
  const [activeSection, setActiveSection] = useState("appearance");
  const { i18n, t } = useTranslation("pages");
  const user = useAppUserStore((state) => state.user);

  return (
    <div className="max-w-6xl mx-auto rtl:font-arabic-body rtl:space-x-reverse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-6 w-6 text-inn-bg-accent" />
          <h1 className="text-3xl font-bold text-gray-900">{t("settings.title")}</h1>
        </div>
        <p className="text-gray-600">{t("settings.description")}</p>
      </div>

      {/* Settings Navigation and Content */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="relative flex gap-8 flex-col">
        {/* Sidebar Navigation */}
        <div className="w-full shrink-0">
          {/* <Select onValueChange={(value) => setActiveSection(value)} defaultValue={activeSection}>
            <SelectTrigger className="md:hidden w-full">
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
          </Select> */}
          <TabsList dir={i18n.dir()} className="bg-transparent max-w-auto w-full">
            {settingsSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap",
                  "data-[state=active]:font-medium data-[state=active]:text-inn-bg-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "dark:data-[state=active]:text-inn-bg-accent dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none",
                  "text-inn-text-secondary hover:text-inn-text-primary",
                  "transition-all duration-300 ease-in-out",
                  "border-none rounded-none",
                  "w-full "
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  {section.icon}
                  <span className="font-medium rtl:text-right rtl:mt-0.5 rtl:text-base ltr:text-left flex-1 rtl:font-arabic-body sr-only sm:not-sr-only">
                    {t(`${section.id}.label`, { ns: "pages", keyPrefix: "settings.sections" })}
                  </span>
                  {/* {section.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto hidden sm:inline text-xs bg-inn-bg-flame text-white py-0.5 px-2 rounded-xl hover:bg-inn-bg-flame-dark hover:text-white "
                    >
                      {section.badge}
                    </Badge>
                  )} */}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {settingsSections.map((section) => {
            const SectionComponent = section.component;
            const { label, description } = t(section.id, {
              ns: "pages",
              keyPrefix: "settings.sections",
              returnObjects: true,
              defaultValue: { label: "", description: "" },
            }) as { label: string; description: string };
            return (
              <TabsContent dir={i18n.dir()} key={section.id} value={section.id} className="mt-0">
                <div className="">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">{label}</h2>
                        <p className="text-sm sm:text-base text-[var(--text-secondary)]">{description}</p>
                      </div>

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
