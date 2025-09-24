"use client";

import { useState } from "react";
import { Clock, Eye, Key, Monitor, Shield, Smartphone } from "lucide-react";

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

  const mockDevices = [
    {
      id: "1",
      name: "MacBook Pro",
      type: "desktop",
      location: "San Francisco, CA",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "2",
      name: "iPhone 15",
      type: "mobile",
      location: "San Francisco, CA",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: "3",
      name: "Chrome on Windows",
      type: "desktop",
      location: "New York, NY",
      lastActive: "3 days ago",
      current: false,
    },
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
          <Key className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Password & Authentication</h3>
        </div>

        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-600">Last changed 3 months ago</p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
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
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Session Management</h3>
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

          {/* Login Alerts */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Login Alerts</h4>
              <p className="text-sm text-gray-600">Get notified when someone signs into your account</p>
            </div>
            <button
              onClick={() => setLoginAlerts(!loginAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                loginAlerts ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  loginAlerts ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Device Management */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Device Management</h3>
        </div>

        <div className="space-y-4">
          {/* Device Tracking */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Device Tracking</h4>
              <p className="text-sm text-gray-600">Keep track of devices that access your account</p>
            </div>
            <button
              onClick={() => setDeviceTracking(!deviceTracking)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                deviceTracking ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  deviceTracking ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Active Devices */}
          {deviceTracking && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Active Devices</h4>
              {mockDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {device.type === "mobile" ? (
                        <Smartphone className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Monitor className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 flex items-center gap-2">
                        {device.name}
                        {device.current && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </h5>
                      <p className="text-sm text-gray-600">{device.location}</p>
                      <p className="text-xs text-gray-500">{device.lastActive}</p>
                    </div>
                  </div>
                  {!device.current && (
                    <Button variant="outline" size="sm">
                      Sign Out
                    </Button>
                  )}
                </div>
              ))}

              <Button variant="outline" className="w-full">
                Sign Out All Other Devices
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Privacy & Security Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Privacy & Security</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Download Your Data</h4>
              <p className="text-sm text-gray-600">Get a copy of all your data stored with Innuora</p>
            </div>
            <Button variant="outline">Request Data</Button>
          </div>
        </div>
      </div>

      {/* Account Security Score */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Security Score</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${twoFactorEnabled ? 85 : 65}%` }}
            />
          </div>
          <span className="font-medium text-gray-900">{twoFactorEnabled ? "85" : "65"}/100</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {twoFactorEnabled
            ? "Great! Your account is well protected."
            : "Consider enabling two-factor authentication to improve your score."}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button>Save Security Settings</Button>
      </div>
    </div>
  );
}
