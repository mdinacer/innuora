"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Eye, Globe, Lock, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getUserConfig, updateUserConfig } from "@/app/actions/user-config-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function PrivacySettings(): React.JSX.Element {
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [shareImprovements, setShareImprovements] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("pages/settings", { keyPrefix: "settings.privacySettings" });

  const toastMessages = t("toast", { returnObjects: true, defaultValue: {} }) as {
    success: string;
    error: string;
  };
  const overview = t("overview", { returnObjects: true, defaultValue: {} }) as { message: string };
  const encryption = t("encryption", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    cards: Array<{ title: string; description: string; pill?: string }>;
  };
  const [endToEndEncryption, zeroKnowledge] = encryption.cards || [];
  const cloud = t("cloud", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    card: { title: string; description: string; note: { label: string; message: string } };
  };
  const retention = t("retention", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    card: { title: string; description: string };
  };
  const danger = t("danger", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    delete: { title: string; description: string; button: string };
  };
  const actionLabels = t("actions", { returnObjects: true, defaultValue: {} }) as { save: string; saving: string };

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
      toast.success(toastMessages.success);
    } catch {
      toast.error(toastMessages.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <Alert className="rounded-2xl border-inn-bg-accent/30 bg-inn-bg-soft">
        <Shield className="h-4 w-4 text-inn-bg-accent" />
        <AlertDescription className="text-inn-text-secondary">{overview.message}</AlertDescription>
      </Alert>

      {/* Data Encryption */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">{encryption.title}</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">{endToEndEncryption?.title}</h4>
                <p className="text-sm text-inn-text-secondary mb-2">{endToEndEncryption?.description}</p>
                {endToEndEncryption?.pill && (
                  <div className="inline-block rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                    {endToEndEncryption.pill}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">{zeroKnowledge?.title}</h4>
                <p className="text-sm text-inn-text-secondary">{zeroKnowledge?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Sync & Storage */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">{cloud.title}</h3>
        </div>

        <div className="rounded-xl border border-inn-bg-accent/30 bg-inn-bg-soft p-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-inn-bg-accent mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">{cloud.card.title}</h4>
              <p className="text-sm text-inn-text-secondary mb-2">{cloud.card.description}</p>
              <p className="text-xs text-inn-text-secondary">
                <strong>{cloud.card.note.label}</strong> {cloud.card.note.message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">{retention.title}</h3>
        </div>

        <div className="rounded-xl border border-inn-border-light bg-inn-bg-soft p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-inn-bg-accent mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">{retention.card.title}</h4>
              <p className="text-sm text-inn-text-secondary">{retention.card.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          {danger.title}
        </h4>

        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-inn-bg-card p-4">
          <div>
            <h5 className="font-semibold mb-1">{danger.delete.title}</h5>
            <p className="text-sm text-inn-text-secondary">{danger.delete.description}</p>
          </div>
          <Button
            variant="destructive"
            className="rounded-2xl px-6 py-2 font-semibold shadow-lg hover:opacity-90 transition"
          >
            {danger.delete.button}
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
          {isLoading ? actionLabels.saving : actionLabels.save}
        </Button>
      </div>
    </div>
  );
}
