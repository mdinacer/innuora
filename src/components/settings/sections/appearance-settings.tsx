"use client";

import { useEffect, useState } from "react";
import { Layout, Monitor, Moon, Sun, Type } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { getUserConfig, updateAppearanceSettings } from "@/app/actions/user-config-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// =========================
// Types
// =========================

type ThemeMode = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";

// =========================
// Appearance Settings Component
// =========================

export default function AppearanceSettings(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>((theme as ThemeMode | undefined) || "system");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [enableAnimation, setAnimated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load user config on component mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const result = await getUserConfig();

        if (result.error) {
          console.error("Failed to load user config:", result.error.message);
          return;
        }

        const config = result.data;
        if (config) {
          setThemeMode((config.theme as ThemeMode) || "system");
          setFontSize((config.fontSize as FontSize) || "medium");
          setAnimated(config.enableAnimation);
        }
      } catch (error) {
        console.error("Failed to load user config:", error);
      }
    }
    loadConfig();
  }, []);

  // Save settings function
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await updateAppearanceSettings({
        theme: themeMode,
        fontSize: fontSize,
        enableAnimation: enableAnimation,
      });

      // Update theme in next-themes
      setTheme(themeMode);

      toast.success("Appearance settings saved!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { id: "light", label: "Light", icon: <Sun className="h-4 w-4" />, description: "Light theme" },
    { id: "dark", label: "Dark", icon: <Moon className="h-4 w-4" />, description: "Dark theme" },
    { id: "system", label: "System", icon: <Monitor className="h-4 w-4" />, description: "Match system preference" },
  ];

  const fontSizeOptions = [
    { id: "small", label: "Small", example: "14px" },
    { id: "medium", label: "Medium", example: "16px" },
    { id: "large", label: "Large", example: "18px" },
  ];

  return (
    <div className="space-y-8">
      {/* Theme Mode */}
      <p>{theme}</p>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-5 w-5 " />
          <h3 className="text-lg font-medium ">Theme</h3>
        </div>
        <p className="text-sm  mb-4">Choose how Innuora looks and feels across all your devices.</p>

        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setThemeMode(option.id as ThemeMode)}
              className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-gray-300 ${
                themeMode === option.id ? "border-blue-500 " : "border-gray-200 "
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {option.icon}
                <span className="font-medium">{option.label}</span>
                {themeMode === option.id && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-xs ">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Type className="h-5 w-5 " />
          <h3 className="text-lg font-medium ">Font Size</h3>
        </div>
        <p className="text-sm  mb-4">Adjust the text size for better readability.</p>

        <div className="grid grid-cols-3 gap-4">
          {fontSizeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFontSize(option.id as FontSize)}
              className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-gray-300 ${
                fontSize === option.id ? "border-blue-500 " : "border-gray-200 "
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{option.label}</span>
                {fontSize === option.id && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-xs ">{option.example}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Layout Options */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layout className="h-5 w-5 " />
          <h3 className="text-lg font-medium ">Layout</h3>
        </div>
        {/* <p className="text-sm  mb-4">Customize the layout and spacing of the interface.</p> */}

        <div className="space-y-4 hidden sm:block">
          {/* Animated Mode */}
          <div className="flex items-center justify-between p-4  rounded-lg">
            <div>
              <h4 className="font-medium ">Background Animation</h4>
              <p className="text-sm ">Show a background animation in the background.</p>
            </div>
            <button
              onClick={() => setAnimated(!enableAnimation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableAnimation ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full  transition-transform ${
                  enableAnimation ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Appearance Settings"}
        </Button>
      </div>
    </div>
  );
}
