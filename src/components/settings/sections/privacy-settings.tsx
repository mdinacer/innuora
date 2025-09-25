"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Eye, Globe, Lock, Shield } from "lucide-react";

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
  const [encryptSessions, setEncryptSessions] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [shareImprovements, setShareImprovements] = useState(true);
  const [sessionRetention, setSessionRetention] = useState(90);
  const [autoDelete, setAutoDelete] = useState(false);

  const retentionOptions = [
    { value: 30, label: "30 days" },
    { value: 90, label: "3 months" },
    { value: 180, label: "6 months" },
    { value: 365, label: "1 year" },
    { value: -1, label: "Never delete" },
  ];

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

          {/* Local Storage Encryption */}
          <div className="flex items-center justify-between p-4  rounded-lg">
            <div>
              <h4 className="font-medium">Local Storage Encryption</h4>
              <p className="text-sm">Encrypt data stored on your device for additional security</p>
            </div>
            <button
              onClick={() => setEncryptSessions(!encryptSessions)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                encryptSessions ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  encryptSessions ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
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
          {/* Cloud Sync Toggle */}
          <div className="flex items-center justify-between p-4  rounded-lg">
            <div>
              <h4 className="font-medium">Cloud Backup</h4>
              <p className="text-sm">Securely backup your encrypted sessions to the cloud for access across devices</p>
            </div>
            <button
              onClick={() => setCloudSync(!cloudSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                cloudSync ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  cloudSync ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {cloudSync && (
            <div className="ml-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Even with cloud sync enabled, your data remains encrypted. We cannot read your
                conversations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Data Retention */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-medium">Data Retention</h3>
        </div>

        <div className="space-y-4">
          {/* Retention Period */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label htmlFor="session-retention" className="text-sm font-medium text-gray-700">
              Keep sessions for
            </label>
            <div className="col-span-2">
              <select
                id="session-retention"
                value={sessionRetention}
                onChange={(e) => setSessionRetention(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {retentionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto Delete */}
          <div className="flex items-center justify-between p-4  rounded-lg">
            <div>
              <h4 className="font-medium">Automatic Deletion</h4>
              <p className="text-sm">Automatically delete sessions older than the retention period</p>
            </div>
            <button
              onClick={() => setAutoDelete(!autoDelete)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoDelete ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoDelete ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
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
          <div className="flex items-center justify-between p-4  rounded-lg">
            <div>
              <h4 className="font-medium">Usage Analytics</h4>
              <p className="text-sm">Share anonymous usage data to help improve Innuora (no conversation content)</p>
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
          <div className="flex items-center justify-between p-4  rounded-lg">
            <div>
              <h4 className="font-medium">Product Improvements</h4>
              <p className="text-sm">Receive suggestions for new features based on your usage patterns</p>
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
        <Button>Save Privacy Settings</Button>
      </div>
    </div>
  );
}
