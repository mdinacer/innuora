"use client";

import { useState } from "react";
import { Clock, Download, Key, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SecuritySettings(): React.JSX.Element {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const { t } = useTranslation("pages/settings", { keyPrefix: "settings.securitySettings" });

  const timeoutMap = t("session.timeoutOptions", {
    returnObjects: true,
    defaultValue: {},
  }) as Record<string, string>;
  const timeoutOptions = Object.entries(timeoutMap)
    .map(([value, label]) => ({ value: Number(value), label }))
    .sort((a, b) => a.value - b.value);
  const overview = t("overview", { returnObjects: true, defaultValue: {} }) as { message: string };
  const auth = t("auth", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    password: { title: string; lastChanged: string };
    changeButton: string;
    twoFactor: {
      title: string;
      description: string;
      recommended: string;
      enable: string;
      disable: string;
      activeNotice: string;
    };
  };
  const session = t("session", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    autoLogout: { title: string; description: string };
  };
  const exportCopy = t("export", { returnObjects: true, defaultValue: {} }) as {
    title: string;
    card: { title: string; description: string; button: string };
  };
  const actionLabels = t("actions", { returnObjects: true, defaultValue: {} }) as { save: string };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Alert className="rounded-2xl border-inn-bg-accent/30 bg-inn-bg-soft">
        <Shield className="h-4 w-4 text-inn-bg-accent" />
        <AlertDescription className="text-inn-text-secondary">{overview.message}</AlertDescription>
      </Alert>

      {/* Password & Authentication */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">{auth.title}</h3>
        </div>

        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between rounded-xl border border-inn-border-light p-4 hover:border-inn-bg-accent/50 transition">
            <div>
              <h4 className="font-semibold mb-1">{auth.password.title}</h4>
              <p className="text-sm text-inn-text-secondary">{auth.password.lastChanged}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-inn-border-light hover:border-inn-bg-accent hover:text-inn-bg-accent transition"
            >
              {auth.changeButton}
            </Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="rounded-xl border border-inn-border-light p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold mb-1">{auth.twoFactor.title}</h4>
                <p className="text-sm text-inn-text-secondary">{auth.twoFactor.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {!twoFactorEnabled && (
                  <div className="rounded-full bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-xs font-medium text-orange-600">
                    {auth.twoFactor.recommended}
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
                  {twoFactorEnabled ? auth.twoFactor.disable : auth.twoFactor.enable}
                </Button>
              </div>
            </div>

            {twoFactorEnabled && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 mt-4">
                <p className="text-sm text-green-600 font-medium">{auth.twoFactor.activeNotice}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-inn-bg-accent/10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-inn-bg-accent" />
          <h3 className="text-xl font-semibold">{session.title}</h3>
        </div>

        <div className="rounded-xl border border-inn-border-light p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">{session.autoLogout.title}</h4>
              <p className="text-sm text-inn-text-secondary">{session.autoLogout.description}</p>
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
          <h3 className="text-xl font-semibold">{exportCopy.title}</h3>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-inn-border-light p-4 hover:border-inn-bg-accent/50 transition">
          <div>
            <h4 className="font-semibold mb-1">{exportCopy.card.title}</h4>
            <p className="text-sm text-inn-text-secondary">{exportCopy.card.description}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl border-inn-border-light hover:border-inn-bg-accent hover:text-inn-bg-accent transition"
          >
            {exportCopy.card.button}
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="rounded-2xl bg-inn-bg-accent px-6 py-3 font-semibold text-white hover:opacity-90 transition shadow-lg">
          {actionLabels.save}
        </Button>
      </div>
    </div>
  );
}
