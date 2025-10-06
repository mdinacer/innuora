"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Eye, Globe, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

import { getUserConfig, updateUserConfig } from "@/app/actions/user-config-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function PrivacySettings(): React.JSX.Element {
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [shareImprovements, setShareImprovements] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const result = await getUserConfig();
        if (result.error) return;

        const config = result.data;
        if (config) {
          setAnalyticsOptIn(config.analyticsOptIn);
          setShareImprovements(config.shareImprovements);
        }
      } catch {}
    }
    loadConfig();
  }, []);

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
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Alert className="rounded-2xl border-inn-bg-accent/30 bg-inn-bg-soft">
        <Shield className="h-4 w-4 text-inn-bg-accent" />
        <AlertDescription className="text-inn-text-secondary">
          Your privacy is our priority. All therapeutic conversations are encrypted end-to-end and stored securely. You
          have full control over your data and can delete it at any time.
        </AlertDescription>
      </Alert>

      {/* Data Encryption */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Data Encryption</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">End-to-End Encryption</h4>
                <p className="text-sm text-inn-text-secondary mb-2">
                  All your conversations are encrypted locally before being stored
                </p>
                <div className="inline-block rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                  Always Enabled
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Zero-Knowledge Architecture</h4>
                <p className="text-sm text-inn-text-secondary">
                  We cannot read your conversations. Only you have the encryption key.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Sync & Storage */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Cloud Sync & Storage</h3>
        </div>

        <div className="rounded-xl border border-inn-bg-accent/30 bg-inn-bg-soft p-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-inn-bg-accent mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Cloud Backup</h4>
              <p className="text-sm text-inn-text-secondary mb-2">
                Cloud backup is configured per session. When creating a session, you can choose whether to store it on
                the cloud.
              </p>
              <p className="text-xs text-inn-text-secondary">
                <strong>Note:</strong> All cloud data remains encrypted. We cannot read your conversations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Data Retention</h3>
        </div>

        <div className="rounded-xl border border-inn-border-light bg-inn-bg-soft p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-inn-bg-accent mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Full Control</h4>
              <p className="text-sm text-inn-text-secondary">
                Sessions are kept until you manually delete them. You can delete individual sessions or all data from
                the danger zone below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h4>

        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-inn-bg-card p-4">
          <div>
            <h5 className="font-semibold mb-1">Delete All Data</h5>
            <p className="text-sm text-inn-text-secondary">
              Permanently delete all your conversations and account data. This cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            className="rounded-2xl px-6 py-2 font-semibold shadow-lg hover:opacity-90 transition"
          >
            Delete Everything
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isLoading}
          className="rounded-2xl bg-inn-bg-accent px-6 py-3 font-semibold text-white hover:opacity-90 transition shadow-lg"
        >
          {isLoading ? "Saving..." : "Save Privacy Settings"}
        </Button>
      </div>
    </div>
  );
}
