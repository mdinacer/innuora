"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import { LanguagesIcon, Monitor, Moon, Sun, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { updateUserConfig } from "@/app/actions/user-config-actions";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app";
import { AppLocales } from "@/lib/i18n";
import i18nConfig from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useAppUserStore } from "@/stores/app-user.store";

type ThemeMode = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export default function AppearanceSettings(): React.JSX.Element {
  const {
    t,
    i18n: { language },
  } = useTranslation(["pages/settings", "common"]);
  const hasHydrated = useAppUserStore((state) => state.hasHydrated);
  const userConfig = useAppUserStore((state) => state.user?.config);
  const { setTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<ThemeMode | undefined>(undefined);
  const [fontSize, setFontSize] = useState<FontSize | undefined>(undefined);
  const [locale, setLocale] = useState<AppLocales | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const currentPathname = usePathname();

  const isInitialRunRef = useRef(true);

  const handleChangeLocale = useCallback(
    (newLocale: AppLocales) => {
      // set cookie for next-i18n-router
      setIsLoading(true);
      const days = 30;
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = date.toUTCString();
      document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

      // redirect to the new locale path
      if (language === i18nConfig.defaultLocale && !i18nConfig.prefixDefault) {
        router.push("/" + newLocale + currentPathname);
      } else {
        router.push(currentPathname.replace(`/${language}`, `/${newLocale}`));
      }

      router.refresh();
    },
    [language, currentPathname, router]
  );

  const saveSettings = async () => {
    if (!themeMode || !fontSize) return;
    setIsLoading(true);
    try {
      const updateData: Prisma.UserConfigCreateWithoutUserInput = {
        ...(themeMode ? { theme: themeMode } : {}),
        ...(fontSize ? { fontSize: fontSize } : {}),
        ...(locale ? { locale: locale } : {}),
      };

      if (Object.keys(updateData).length === 0) {
        return;
      }

      const { data, error } = await updateUserConfig(updateData);

      if (data && !error) {
        useAppUserStore.getState().updateUserConfig((config) => ({
          ...config,
          ...data,
        }));
      }

      setTheme(themeMode);
      if (locale && locale !== language) {
        handleChangeLocale(locale);
      }

      toast.success(t("settings.appearance.toast.success"));
    } catch {
      toast.error(t("settings.appearance.toast.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const actions = {
    save: t("settings.appearance.actions.save"),
    saving: t("settings.appearance.actions.saving"),
    cancel: t("settings.appearance.actions.cancel"),
  };

  const sections = (t("settings.appearance.sections", {
    returnObjects: true,
    defaultValue: "",
    app_name: APP_CONFIG.name,
  }) || {}) as Record<"fontSize" | "theme" | "language", { title: string; description: string; status: string }>;

  const { themeOptions, fontSizeOptions, languageOptions } = {
    themeOptions: (t("lists.theme", { returnObjects: true, defaultValue: "" }) || {}) as Record<
      ThemeMode,
      { label: string; description: string }
    >,
    fontSizeOptions: (t("lists.fontSize", { returnObjects: true, defaultValue: "" }) || {}) as Record<
      FontSize,
      { label: string; value: string }
    >,
    languageOptions: (t("lists.languages", { returnObjects: true, defaultValue: "" }) || {}) as Record<
      AppLocales,
      { label: string; native: string }
    >,
  };

  useEffect(() => {
    if (!isInitialRunRef.current) return;
    if (hasHydrated && !!userConfig) {
      setThemeMode(userConfig.theme as ThemeMode);
      setFontSize(userConfig.fontSize as FontSize);
      setLocale(language as AppLocales);
      isInitialRunRef.current = false;
    }
  }, [hasHydrated, language, userConfig]);

  const appearanceStatus = {
    loading: t("settings.appearance.status.loading"),
    missingConfig: t("settings.appearance.status.missingConfig"),
  };

  if (!hasHydrated) {
    return <div className="text-sm text-muted-foreground">{appearanceStatus.loading}</div>;
  }

  if (!userConfig) {
    return <div className="text-sm text-muted-foreground">{appearanceStatus.missingConfig}</div>;
  }

  return (
    <div className="space-y-6">
      {/* UI Language */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <LanguagesIcon className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">{sections.language.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{sections.language.description}</p>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(languageOptions).map(([key, option]) => (
            <button
              key={key}
              onClick={() => setLocale(key as AppLocales)}
              className={cn(
                "rounded-xl border-2 p-4 transition-all hover:shadow-elevated",
                language === key ? "border-primary bg-muted" : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="text-center">
                <div className="font-semibold mb-1">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.native}</div>
                {locale === key && (
                  <div className="mt-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    {sections.language.status}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Mode */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">{sections.theme.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{sections.theme.description}</p>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(themeOptions).map(([key, option]) => {
            const Icon = THEME_ICONS[key as ThemeMode];
            return (
              <button
                key={key}
                onClick={() => setThemeMode(key as ThemeMode)}
                className={cn(
                  "rounded-xl border-2 p-4 transition-all hover:shadow-elevated",
                  themeMode === key ? "border-primary bg-muted" : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className="size-4 shrink-0" />
                  <span className="font-semibold">{option.label}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">{option.description}</p>
                {themeMode === key && (
                  <div className="mt-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    {sections.theme.status}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Type className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">{sections.fontSize.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{sections.fontSize.description}</p>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(fontSizeOptions).map(([id, option]) => (
            <button
              key={id}
              onClick={() => setFontSize(id as FontSize)}
              className={cn(
                "rounded-xl border-2 p-4 transition-all hover:shadow-elevated",
                fontSize === id ? "border-primary bg-muted" : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="text-center">
                <div className="font-semibold mb-2">{option.label}</div>
                <div className="text-muted-foreground min-h-7" style={{ fontSize: option.value }}>
                  Aa
                </div>
                {fontSize === id && (
                  <div className="mt-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                    {sections.fontSize.status}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isLoading}
          className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-90 transition shadow-lg"
        >
          {isLoading ? actions.saving : actions.save}
        </Button>
      </div>
    </div>
  );
}
