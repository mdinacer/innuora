"use client";

import { useState } from "react";
import { Layout, Monitor, Moon, Palette, Sun, Type } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// =========================
// Types
// =========================

type ThemeMode = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";
type ColorScheme = "blue" | "purple" | "green" | "orange";

// =========================
// Appearance Settings Component
// =========================

export default function AppearanceSettings(): React.JSX.Element {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("blue");
  const [compactMode, setCompactMode] = useState(false);

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

  const colorSchemeOptions = [
    { id: "blue", label: "Blue", color: "bg-blue-500" },
    { id: "purple", label: "Purple", color: "bg-purple-500" },
    { id: "green", label: "Green", color: "bg-green-500" },
    { id: "orange", label: "Orange", color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Theme Mode */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Theme</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Choose how Innuora looks and feels across all your devices.</p>

        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setThemeMode(option.id as ThemeMode)}
              className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-gray-300 ${
                themeMode === option.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
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
              <p className="text-xs text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Color Scheme</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Select your preferred accent color for buttons, links, and highlights.
        </p>

        <div className="grid grid-cols-4 gap-4">
          {colorSchemeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setColorScheme(option.id as ColorScheme)}
              className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-gray-300 ${
                colorScheme === option.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${option.color}`} />
                <span className="font-medium">{option.label}</span>
              </div>
              {colorScheme === option.id && (
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Type className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Font Size</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Adjust the text size for better readability.</p>

        <div className="grid grid-cols-3 gap-4">
          {fontSizeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFontSize(option.id as FontSize)}
              className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-gray-300 ${
                fontSize === option.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
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
              <p className="text-xs text-gray-600">{option.example}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Layout Options */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layout className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Layout</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Customize the layout and spacing of the interface.</p>

        <div className="space-y-4">
          {/* Compact Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Compact Mode</h4>
              <p className="text-sm text-gray-600">Reduce spacing and padding for a denser layout</p>
            </div>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                compactMode ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  compactMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Preview</h4>
        <div className="bg-white rounded-md border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${colorSchemeOptions.find((c) => c.id === colorScheme)?.color}`} />
            <div>
              <h5
                className={`font-medium ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"}`}
              >
                Sample Message
              </h5>
              <p
                className={`text-gray-600 ${fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-base" : "text-sm"}`}
              >
                This is how your messages will appear with the current settings.
              </p>
            </div>
          </div>
          <Button size={compactMode ? "sm" : "default"} className="w-full">
            Sample Button
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button>Save Appearance Settings</Button>
      </div>
    </div>
  );
}
