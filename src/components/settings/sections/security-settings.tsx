"use client";

import { useState } from "react";
import { Clock, Download, Key, Shield } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SecuritySettings(): React.JSX.Element {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);

  const timeoutOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 480, label: "8 hours" },
    { value: -1, label: "Never" },
  ];

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Alert className="rounded-2xl border-inn-bg-accent/30 bg-inn-bg-soft">
        <Shield className="h-4 w-4 text-inn-bg-accent" />
        <AlertDescription className="text-inn-text-secondary">
          Your account security is strong. We recommend enabling two-factor authentication for additional protection.
        </AlertDescription>
      </Alert>

      {/* Password & Authentication */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Password & Authentication</h3>
        </div>

        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between rounded-xl border border-inn-border-light p-4 hover:border-inn-bg-accent/50 transition">
            <div>
              <h4 className="font-semibold mb-1">Password</h4>
              <p className="text-sm text-inn-text-secondary">Last changed 3 months ago</p>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-inn-border-light hover:border-inn-bg-accent hover:text-inn-bg-accent transition"
            >
              Change Password
            </Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="rounded-xl border border-inn-border-light p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold mb-1">Two-Factor Authentication</h4>
                <p className="text-sm text-inn-text-secondary">Add an extra layer of security to your account</p>
              </div>
              <div className="flex items-center gap-3">
                {!twoFactorEnabled && (
                  <div className="rounded-full bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-xs font-medium text-orange-600">
                    Recommended
                  </div>
                )}
                <Button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={cn(
                    "rounded-2xl px-6 py-2 font-semibold shadow-lg transition",
                    twoFactorEnabled
                      ? "bg-inn-bg-secondary text-inn-text-primary hover:bg-inn-bg-secondary/80"
                      : "bg-inn-bg-accent text-white hover:opacity-90"
                  )}
                >
                  {twoFactorEnabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>

            {twoFactorEnabled && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 mt-4">
                <p className="text-sm text-green-600 font-medium">
                  ✓ Two-factor authentication is active. Your account is protected with SMS verification.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Session Management</h3>
        </div>

        <div className="rounded-xl border border-inn-border-light p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Auto-logout</h4>
              <p className="text-sm text-inn-text-secondary">Automatically sign out after period of inactivity</p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              className="rounded-xl border border-inn-border-light bg-inn-bg-card px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inn-bg-accent transition"
            >
              {timeoutOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">Data Export</h3>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-inn-border-light p-4 hover:border-inn-bg-accent/50 transition">
          <div>
            <h4 className="font-semibold mb-1">Download Your Data</h4>
            <p className="text-sm text-inn-text-secondary">Get a copy of all your data stored with Innuora</p>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl border-inn-border-light hover:border-inn-bg-accent hover:text-inn-bg-accent transition"
          >
            Request Data
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="rounded-2xl bg-inn-bg-accent px-6 py-3 font-semibold text-white hover:opacity-90 transition shadow-lg">
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}
