"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Eye, Globe, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

import { getUserConfig, updateUserConfig } from "@/app/actions/user-config-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// =========================
// Types
// =========================

// =========================
// Privacy Settings Component
// =========================

export default function PrivacySettings(): React.JSX.Element {
  // Note: Encryption is always enabled, cloud sync is per-session setting
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [shareImprovements, setShareImprovements] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load user config on component mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const result = await getUserConfig();

        if (result.error) {
          return;
        }

        const config = result.data;
        if (config) {
          setAnalyticsOptIn(config.analyticsOptIn);
          setShareImprovements(config.shareImprovements);
        }
      } catch {}
    }
    loadConfig();
  }, []);

  // Save settings function
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await updateUserConfig({
        analyticsOptIn,
        shareImprovements,
      });

      toast.success("Privacy settings saved!");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Privacy Overview */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your privacy is our priority. All therapeutic conversations are encrypted end-to-end and stored securely. You
          have full control over your data and can delete it at any time.
        </AlertDescription>
      </Alert>

      {/* Data Encryption */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5" />
          <h3 className="text-lg font-medium">Data Encryption</h3>
        </div>

        <div className="space-y-4">
          {/* Session Encryption */}
          <div className="flex items-center justify-between p-4  rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">End-to-End Encryption</h4>
                <p className="text-sm">All your conversations are encrypted locally before being stored</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Always Enabled
                </Badge>
              </div>
            </div>
            <div className="text-green-600">
              <Eye className="h-5 w-5" />
            </div>
          </div>

          {/* Local Storage Encryption - Always Enabled */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Local Storage Encryption</h4>
                <p className="text-sm text-green-800">All data stored on your device is automatically encrypted</p>
                <Badge variant="outline" className="mt-2 text-xs border-green-300 text-green-800">
                  Always Enabled
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Sync & Storage */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5" />
          <h3 className="text-lg font-medium">Cloud Sync & Storage</h3>
        </div>

        <div className="space-y-4">
          {/* Cloud Sync Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Cloud Backup</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Cloud backup is configured per session. When creating a session, you can choose whether to store it on
                  the cloud.
                </p>
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> All cloud data remains encrypted. We cannot read your conversations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-medium">Data Management</h3>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Manual Data Control</h4>
              <p className="text-sm text-gray-700 mb-2">
                You have full control over your data. Sessions are kept until you manually delete them.
              </p>
              <p className="text-xs text-gray-600">
                You can delete individual sessions or all data from the session management page or danger zone below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Improvements */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-lg font-medium">Analytics & Improvements</h3>
        </div>

        <div className="space-y-4">
          {/* Analytics Opt-in */}
          <div className="flex items-center justify-between p-4 rounded-lg">
            <div>
              <h4 className="font-medium">Usage Analytics</h4>
              <p className="text-sm">Share anonymous usage data to help improve Innuora (no conversation content)</p>
              <Badge variant="outline" className="mt-1 text-xs">
                Future Feature
              </Badge>
            </div>
            <button
              onClick={() => setAnalyticsOptIn(!analyticsOptIn)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                analyticsOptIn ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  analyticsOptIn ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Improvement Suggestions */}
          <div className="flex items-center justify-between p-4 rounded-lg">
            <div>
              <h4 className="font-medium">Product Improvements</h4>
              <p className="text-sm">Receive suggestions for new features based on your usage patterns</p>
              <Badge variant="outline" className="mt-1 text-xs">
                Future Feature
              </Badge>
            </div>
            <button
              onClick={() => setShareImprovements(!shareImprovements)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shareImprovements ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shareImprovements ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h4 className="font-medium text-red-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-red-900">Delete All Data</h5>
              <p className="text-sm text-red-700">
                Permanently delete all your conversations and account data. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Everything
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Privacy Settings"}
        </Button>
      </div>
    </div>
  );
}
