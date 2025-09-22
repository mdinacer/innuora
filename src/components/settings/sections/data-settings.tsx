"use client";

import { useState } from "react";
import { AlertTriangle, Archive, Cloud, Database, Download, HardDrive } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// =========================
// Types
// =========================

// =========================
// Data Settings Component
// =========================

export default function DataSettings(): React.JSX.Element {
  const [autoBackup, setAutoBackup] = useState(true);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [exportInProgress, setExportInProgress] = useState(false);

  // Mock data usage statistics
  const dataUsage = {
    total: "2.4 GB",
    sessions: "2.1 GB",
    analyses: "180 MB",
    media: "120 MB",
    localStorage: "1.8 GB",
    cloudStorage: "2.4 GB",
    sessionCount: 47,
    messageCount: 1243,
    analysisCount: 89,
  };

  const handleExportData = async () => {
    setExportInProgress(true);
    // Simulate export process
    setTimeout(() => {
      setExportInProgress(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Data Usage Overview */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Data Usage</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Local Storage */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Local Storage</h4>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{dataUsage.localStorage}</div>
            <p className="text-sm text-gray-600">Stored on your device</p>
          </div>

          {/* Cloud Storage */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-gray-900">Cloud Backup</h4>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{dataUsage.cloudStorage}</div>
            <p className="text-sm text-gray-600">Encrypted backup</p>
          </div>
        </div>

        {/* Data Breakdown */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900">Data Breakdown</h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-700">
                  {dataUsage.sessionCount} Sessions ({dataUsage.messageCount} messages)
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{dataUsage.sessions}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm text-gray-700">{dataUsage.analysisCount} Analysis snapshots</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{dataUsage.analyses}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Media & attachments</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{dataUsage.media}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Archive className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Backup Settings</h3>
        </div>

        <div className="space-y-4">
          {/* Auto Backup */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Automatic Backup</h4>
              <p className="text-sm text-gray-600">Automatically backup your data to secure cloud storage</p>
            </div>
            <button
              onClick={() => setAutoBackup(!autoBackup)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoBackup ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoBackup ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Compression */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Data Compression</h4>
              <p className="text-sm text-gray-600">Compress data to reduce storage usage (recommended)</p>
            </div>
            <button
              onClick={() => setCompressionEnabled(!compressionEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                compressionEnabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  compressionEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Last Backup */}
          {autoBackup && (
            <div className="ml-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <p className="text-sm text-green-800">
                <strong>Last backup:</strong> 2 hours ago • Next backup: in 22 hours
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Data Export */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Data Export</h3>
        </div>

        <div className="space-y-4">
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              Export your data in standard formats. This includes all your conversations, analyses, and account
              information.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Complete Export</h4>
              <p className="text-sm text-gray-600 mb-3">All data including conversations, analyses, and settings</p>
              <Button onClick={handleExportData} disabled={exportInProgress} className="w-full">
                {exportInProgress ? "Preparing..." : "Export All Data"}
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Sessions Only</h4>
              <p className="text-sm text-gray-600 mb-3">Just your conversation sessions in JSON format</p>
              <Button variant="outline" className="w-full">
                Export Sessions
              </Button>
            </div>
          </div>

          {exportInProgress && (
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm text-blue-800">
                Preparing your data export. This may take a few minutes depending on the amount of data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Storage Management */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Storage Management</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Clear Local Cache</h4>
              <p className="text-sm text-gray-600">Remove temporary files and cached data</p>
            </div>
            <Button variant="outline" size="sm">
              Clear Cache
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Optimize Storage</h4>
              <p className="text-sm text-gray-600">Compress and reorganize data for better performance</p>
            </div>
            <Button variant="outline" size="sm">
              Optimize Now
            </Button>
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
              <h5 className="font-medium text-red-900">Delete All Local Data</h5>
              <p className="text-sm text-red-700">
                Remove all data stored on this device. Cloud backups will remain intact.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Local Data
            </Button>
          </div>

          <div className="border-t border-red-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-red-900">Delete All Data</h5>
                <p className="text-sm text-red-700">
                  Permanently delete all your data including cloud backups. This cannot be undone.
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Everything
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button>Save Data Settings</Button>
      </div>
    </div>
  );
}
