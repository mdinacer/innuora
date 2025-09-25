"use client";

import { useState } from "react";
import { Clock, Eye, Key, Shield } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// =========================
// Types
// =========================

// =========================
// Security Settings Component
// =========================

export default function SecuritySettings(): React.JSX.Element {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [deviceTracking, setDeviceTracking] = useState(true);

  const timeoutOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 480, label: "8 hours" },
    { value: -1, label: "Never" },
  ];

  return (
    <div className="space-y-8">
      {/* Security Overview */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your account security is strong. We recommend enabling two-factor authentication for additional protection.
        </AlertDescription>
      </Alert>

      {/* Password & Authentication */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5" />
          <h3 className="text-lg font-medium">Password & Authentication</h3>
        </div>

        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between p-4 rounded-lg">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm">Last changed 3 months ago</p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 rounded-lg">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm">Add an extra layer of security to your account</p>
              {twoFactorEnabled && (
                <Badge variant="default" className="mt-2 text-xs">
                  Enabled
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!twoFactorEnabled && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                  Recommended
                </Badge>
              )}
              <Button
                variant={twoFactorEnabled ? "outline" : "default"}
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                {twoFactorEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>

          {twoFactorEnabled && (
            <div className="ml-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <p className="text-sm text-green-800">
                <strong>Two-factor authentication is active.</strong> Your account is protected with SMS verification.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Session Management */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-medium">Session Management</h3>
        </div>

        <div className="space-y-4">
          {/* Session Timeout */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label htmlFor="session-timeout" className="text-sm font-medium text-gray-700">
              Auto-logout after
            </label>
            <div className="col-span-2">
              <select
                id="session-timeout"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>

      {/* Privacy & Security Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5" />
          <h3 className="text-lg font-medium">Privacy & Security</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg">
            <div>
              <h4 className="font-medium">Download Your Data</h4>
              <p className="text-sm">Get a copy of all your data stored with Innuora</p>
            </div>
            <Button variant="outline">Request Data</Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button>Save Security Settings</Button>
      </div>
    </div>
  );
}
