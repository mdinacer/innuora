"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Moon, Shield, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";

// =========================
// Types
// =========================

// =========================
// Notification Settings Component
// =========================

export default function NotificationSettings(): React.JSX.Element {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
        </div>

        <div className="space-y-4">
          {/* Master Email Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive important updates and reminders via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Email Types */}
          {emailNotifications && (
            <div className="ml-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <div>
                    <h5 className="font-medium text-gray-900">Session Reminders</h5>
                    <p className="text-xs text-gray-600">Gentle reminders to continue your journey</p>
                  </div>
                </div>
                <button
                  onClick={() => setSessionReminders(!sessionReminders)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    sessionReminders ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      sessionReminders ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-red-600" />
                  <div>
                    <h5 className="font-medium text-gray-900">Security Alerts</h5>
                    <p className="text-xs text-gray-600">Important security and account updates</p>
                  </div>
                </div>
                <button
                  onClick={() => setSecurityAlerts(!securityAlerts)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    securityAlerts ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      securityAlerts ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-green-600" />
                  <div>
                    <h5 className="font-medium text-gray-900">Product Updates</h5>
                    <p className="text-xs text-gray-600">New features and improvements</p>
                  </div>
                </div>
                <button
                  onClick={() => setProductUpdates(!productUpdates)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    productUpdates ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      productUpdates ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sound Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Sound Notifications</h3>
        </div>

        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-blue-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">Sound Effects</h4>
                <p className="text-sm text-gray-600">Play sounds for notifications and interactions</p>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Test Sound Button */}
          {soundEnabled && (
            <div className="ml-4">
              <Button variant="outline" size="sm">
                Test Sound
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Moon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Quiet Hours</h3>
        </div>

        <div className="space-y-4">
          {/* Quiet Hours Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Enable Quiet Hours</h4>
              <p className="text-sm text-gray-600">Reduce notifications during specified hours</p>
            </div>
            <button
              onClick={() => setQuietHours(!quietHours)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                quietHours ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  quietHours ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Quiet Hours Schedule */}
          {quietHours && (
            <div className="ml-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quiet-start" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="quiet-end" className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Notifications will be reduced between {quietStart} and {quietEnd}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Frequency */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Notification Frequency</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <label htmlFor="session-reminders" className="text-sm font-medium text-gray-700">
              Session Reminders
            </label>
            <div className="col-span-2">
              <select
                id="session-reminders"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="every-3-days">Every 3 days</option>
                <option value="weekly">Weekly</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Notification Preview</h4>
        <div className="bg-white rounded-md border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div>
              <h5 className="font-medium">Innuora</h5>
              <p className="text-sm text-gray-600">
                Your wellbeing check-in is ready. Take a moment for yourself today.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button>Save Notification Settings</Button>
      </div>
    </div>
  );
}
