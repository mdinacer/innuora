"use client";

import { useState } from "react";
import { LanguagesIcon, Monitor, Moon, Sun, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { updateAppearanceSettings } from "@/app/actions/user-config-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";

export default function AppearanceSettings(): React.JSX.Element {
  const {
    i18n: { language },
  } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>((theme as ThemeMode | undefined) || "system");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [isLoading, setIsLoading] = useState(false);

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await updateAppearanceSettings({
        theme: themeMode,
        fontSize: fontSize,
      });

      setTheme(themeMode);
      toast.success("Appearance settings saved!");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { id: "light", label: "Light", icon: <Sun className="h-4 w-4" />, description: "Light theme" },
    { id: "dark", label: "Dark", icon: <Moon className="h-4 w-4" />, description: "Dark theme" },
    { id: "system", label: "System", icon: <Monitor className="h-4 w-4" />, description: "Match system" },
  ];

  const fontSizeOptions = [
    { id: "small", label: "Small", example: "14px" },
    { id: "medium", label: "Medium", example: "16px" },
    { id: "large", label: "Large", example: "18px" },
  ];

  const languageOptions = [
    { id: "ar", label: "العربية", native: "Arabic" },
    { id: "en", label: "English", native: "English" },
    { id: "fr", label: "Français", native: "French" },
  ];

  return (
    <div className="space-y-6">
      {/* UI Language */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <LanguagesIcon className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Language</h3>
        </div>
        <p className="text-sm text-inn-text-secondary mb-6">Choose the language Innuora uses throughout the app.</p>

        <div className="grid grid-cols-3 gap-4">
          {languageOptions.map((option) => (
            <button
              key={option.id}
              className={cn(
                "rounded-xl border-2 p-4 transition-all hover:shadow-card",
                language === option.id
                  ? "border-inn-bg-accent bg-inn-bg-soft"
                  : "border-inn-border-light bg-inn-bg-card hover:border-inn-bg-accent/50"
              )}
            >
              <div className="text-center">
                <div className="font-semibold mb-1">{option.label}</div>
                <div className="text-xs text-inn-text-secondary">{option.native}</div>
                {language === option.id && (
                  <div className="mt-2 inline-block rounded-full bg-inn-bg-accent px-3 py-1 text-xs font-medium text-white">
                    Current
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Mode */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Theme</h3>
        </div>
        <p className="text-sm text-inn-text-secondary mb-6">
          Choose how Innuora looks and feels across all your devices.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setThemeMode(option.id as ThemeMode)}
              className={cn(
                "rounded-xl border-2 p-4 transition-all hover:shadow-card",
                themeMode === option.id
                  ? "border-inn-bg-accent bg-inn-bg-soft"
                  : "border-inn-border-light bg-inn-bg-card hover:border-inn-bg-accent/50"
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {option.icon}
                <span className="font-semibold">{option.label}</span>
              </div>
              <p className="text-xs text-inn-text-secondary text-center">{option.description}</p>
              {themeMode === option.id && (
                <div className="mt-2 inline-block rounded-full bg-inn-bg-accent px-3 py-1 text-xs font-medium text-white">
                  Active
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Type className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Font Size</h3>
        </div>
        <p className="text-sm text-inn-text-secondary mb-6">Adjust text size for better readability.</p>

        <div className="grid grid-cols-3 gap-4">
          {fontSizeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFontSize(option.id as FontSize)}
              className={cn(
                "rounded-xl border-2 p-4 transition-all hover:shadow-card",
                fontSize === option.id
                  ? "border-inn-bg-accent bg-inn-bg-soft"
                  : "border-inn-border-light bg-inn-bg-card hover:border-inn-bg-accent/50"
              )}
            >
              <div className="text-center">
                <div className="font-semibold mb-2">{option.label}</div>
                <div className="text-inn-text-secondary" style={{ fontSize: option.example }}>
                  Aa
                </div>
                {fontSize === option.id && (
                  <div className="mt-2 inline-block rounded-full bg-inn-bg-accent px-3 py-1 text-xs font-medium text-white">
                    Active
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
          className="rounded-2xl bg-inn-bg-accent px-6 py-3 font-semibold text-white hover:opacity-90 transition shadow-lg"
        >
          {isLoading ? "Saving..." : "Save Appearance Settings"}
        </Button>
      </div>
    </div>
  );
}
