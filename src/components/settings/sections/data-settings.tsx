"use client";

import { useState } from "react";
import { AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";

import { exportUserData } from "@/app/actions/data-export-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function DataSettings(): React.JSX.Element {
  const [exportInProgress, setExportInProgress] = useState(false);

  const handleExportData = async () => {
    setExportInProgress(true);
    try {
      const result = await exportUserData();

      if (result.error) {
        toast.error("Failed to export data. Please try again.");
        return;
      }

      // Download file
      const link = document.createElement("a");
      link.href = `data:application/json;base64,${result.data.data}`;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Data exported successfully! (${(result.data.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setExportInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* GDPR Compliance Notice */}
      <Alert className="rounded-2xl border-inn-bg-accent/30 bg-inn-bg-soft">
        <Download className="h-4 w-4 text-inn-bg-accent" />
        <AlertDescription className="text-inn-text-secondary">
          <strong>Your Rights:</strong> Under GDPR and privacy laws, you have the right to access, export, and delete
          your personal data at any time. All exports are provided in machine-readable JSON format.
        </AlertDescription>
      </Alert>

      {/* Data Export */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Data Export</h3>
        </div>

        <p className="text-sm text-inn-text-secondary mb-6">
          Export all your personal data including profile, conversations, credit history, and activity logs. This export
          is GDPR-compliant and includes information about third-party data processors.
        </p>

        <div className="rounded-xl border border-inn-border-light bg-inn-bg-soft p-4">
          <h4 className="font-semibold mb-2">Complete Data Export</h4>
          <p className="text-sm text-inn-text-secondary mb-4">
            Includes: Personal information, profile, sessions metadata, financial data, activity logs, and your data
            protection rights information
          </p>
          <Button
            onClick={handleExportData}
            disabled={exportInProgress}
            className="w-full rounded-2xl bg-inn-bg-accent text-white hover:opacity-90 transition shadow-lg"
          >
            {exportInProgress ? "Preparing Export..." : "Export All Data (JSON)"}
          </Button>

          {exportInProgress && (
            <div className="rounded-xl border border-inn-bg-accent/30 bg-white/50 dark:bg-black/20 p-3 mt-4">
              <p className="text-sm text-inn-bg-accent font-medium">⏳ Gathering your data securely...</p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            📋 Note: Encrypted session data requires your decryption key (stored locally in your browser) to access full
            conversation content.
          </p>
        </div>
      </div>

      {/* Cloud Backup Info */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Cloud Backup</h3>
        </div>

        <div className="rounded-xl border border-inn-border-light bg-inn-bg-soft p-4">
          <p className="text-sm text-inn-text-secondary">
            Cloud backup is configured per session when you create it. You can choose whether each session is stored on
            the cloud or kept local-only. All cloud data is encrypted end-to-end.
          </p>
          <p className="text-xs text-inn-text-secondary mt-2">
            <strong>Privacy Note:</strong> We use zero-knowledge encryption - we cannot read your conversations even
            when stored on the cloud.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-inn-bg-card p-4">
            <div>
              <h5 className="font-semibold mb-1">Delete All Data</h5>
              <p className="text-sm text-inn-text-secondary">
                Permanently delete your account and all associated data including conversations, profile, and credit
                history. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-2xl px-6 py-2 font-semibold shadow-lg hover:opacity-90 transition"
            >
              Delete Everything
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
          <p className="text-sm text-orange-600 dark:text-orange-400">
            ⚠️ <strong>GDPR Compliance:</strong> Upon deletion, all your personal data will be permanently erased from
            our servers within 30 days, as required by data protection regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
