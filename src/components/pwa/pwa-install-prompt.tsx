"use client";

import React, { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
  variant?: "banner" | "modal" | "floating";
  autoShow?: boolean;
  showDelay?: number;
}

export function PWAInstallPrompt({
  className,
  variant = "banner",
  autoShow = true,
  showDelay = 3000,
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      if (autoShow) {
        setTimeout(() => {
          setIsVisible(true);
        }, showDelay);
      }
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [autoShow, showDelay]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsVisible(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Don't show if already installed or dismissed in this session
  if (isInstalled || (typeof window !== "undefined" && sessionStorage.getItem("pwa-prompt-dismissed"))) {
    return null;
  }

  // iOS Safari instructions
  if (isIOS && isVisible) {
    return (
      <div
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 rounded-lg border border-border bg-white p-4 shadow-lg dark:bg-gray-900",
          {
            "top-4": variant === "modal",
            "bottom-20 left-1/2 w-80 -translate-x-1/2": variant === "floating",
          },
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Install Innuora</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Add Innuora to your home screen for a better experience. Tap the Share button{" "}
              <span className="font-mono">⎖</span> then "Add to Home Screen".
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Android/Desktop install prompt
  if (deferredPrompt && isVisible) {
    return (
      <div
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 rounded-lg border border-border bg-white p-4 shadow-lg dark:bg-gray-900",
          {
            "top-4": variant === "modal",
            "bottom-20 left-1/2 w-80 -translate-x-1/2": variant === "floating",
          },
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Install Innuora</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Get the full app experience. Install Innuora to access it from your home screen and use it offline when
              connection is restored.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} className="bg-primary text-white hover:bg-primary">
                Install App
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                Maybe Later
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

// Hook for programmatic access
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setCanInstall(false);

    return outcome === "accepted";
  };

  return {
    installApp,
    canInstall,
    isInstalled,
  };
}
