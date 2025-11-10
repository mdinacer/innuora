"use client";

import { useState } from "react";
import { AlertTriangle, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { exportUserData } from "@/app/actions/data-export-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function DataSettings(): React.JSX.Element {
  const [exportInProgress, setExportInProgress] = useState(false);
  const { t } = useTranslation("pages/settings", { keyPrefix: "settings.dataSettings" });

  const alerts = t("alerts", {
    returnObjects: true,
    defaultValue: {},
  }) as {
    rights: { title: string; message: string };
    gdpr: { label: string; message: string };
    note: { label: string; message: string };
  };
  const exportCopy = t("export", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    description: string;
    card: {
      title: string;
      description: string;
      button: { default: string; loading: string };
      progress: string;
    };
    toast: { success: string; error: string; unexpected: string };
  };
  const backup = t("backup", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    description: string;
    privacy: { label: string; message: string };
  };
  const danger = t("danger", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    delete: { title: string; description: string; button: string };
  };

  const handleExportData = async () => {
    setExportInProgress(true);
    try {
      const result = await exportUserData();

      if (result.error) {
        toast.error(exportCopy.toast.error);
        return;
      }

      // Download file
      const link = document.createElement("a");
      link.href = `data:application/json;base64,${result.data.data}`;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t("export.toast.success", { size: (result.data.size / 1024).toFixed(2) }));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(exportCopy.toast.unexpected);
    } finally {
      setExportInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* GDPR Compliance Notice */}
      <Alert className="rounded-2xl border-primary/30 bg-muted">
        <Download className="h-4 w-4 text-primary" />
        <AlertDescription className="text-muted-foreground">
          <strong>{alerts.rights.title}</strong> {alerts.rights.message}
        </AlertDescription>
      </Alert>

      {/* Data Export */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">{exportCopy.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-6">{exportCopy.description}</p>

        <div className="rounded-xl border border-border bg-muted p-4">
          <h4 className="font-semibold mb-2">{exportCopy.card.title}</h4>
          <p className="text-sm text-muted-foreground mb-4">{exportCopy.card.description}</p>
          <Button
            onClick={handleExportData}
            disabled={exportInProgress}
            className="w-full rounded-2xl bg-primary text-white hover:opacity-90 transition shadow-lg"
          >
            {exportInProgress ? exportCopy.card.button.loading : exportCopy.card.button.default}
          </Button>

          {exportInProgress && (
            <div className="rounded-xl border border-primary/30 bg-white/50 dark:bg-black/20 p-3 mt-4">
              <p className="text-sm text-primary font-medium">{exportCopy.card.progress}</p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            📋 <strong>{alerts.note.label}</strong> {alerts.note.message}
          </p>
        </div>
      </div>

      {/* Cloud Backup Info */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_2px_8px] shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">{backup.title}</h3>
        </div>

        <div className="rounded-xl border border-border bg-muted p-4">
          <p className="text-sm text-muted-foreground">{backup.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>{backup.privacy.label}</strong> {backup.privacy.message}
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          {danger.title}
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-card p-4">
            <div>
              <h5 className="font-semibold mb-1">{danger.delete.title}</h5>
              <p className="text-sm text-muted-foreground">{danger.delete.description}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-2xl px-6 py-2 font-semibold shadow-lg hover:opacity-90 transition"
            >
              {danger.delete.button}
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
          <p className="text-sm text-orange-600 dark:text-orange-400">
            ⚠️ <strong>{alerts.gdpr.label}</strong> {alerts.gdpr.message}
          </p>
        </div>
      </div>
    </div>
  );
}
