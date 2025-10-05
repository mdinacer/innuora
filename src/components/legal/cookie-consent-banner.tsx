"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

import { updateUserConfig } from "@/app/actions/user-config-actions";
import { Button } from "@/components/ui/button";
import { useAppUserStore } from "@/stores/app-user.store";

/**
 * GDPR/ePrivacy Directive compliant cookie consent banner
 * Required before any non-essential cookies or analytics can be used
 */
export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAppUserStore((state) => state.user);

  useEffect(() => {
    // Check if user has already made a consent decision
    const localConsent = localStorage.getItem("cookie-consent");
    const hasUserConfig = user?.config?.analyticsOptIn !== undefined;

    // Show banner if:
    // 1. No local consent recorded AND
    // 2. User is logged in AND
    // 3. User config doesn't have consent recorded
    if (!localConsent && user && !hasUserConfig) {
      // Small delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, [user]);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      // Save consent to user config (database)
      if (user) {
        await updateUserConfig({ analyticsOptIn: true });
      }

      // Save to localStorage for immediate access
      localStorage.setItem("cookie-consent", "accepted");
      localStorage.setItem("analytics-consent", "true");

      setShowBanner(false);
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      // Save rejection to user config
      if (user) {
        await updateUserConfig({ analyticsOptIn: false });
      }

      // Save to localStorage
      localStorage.setItem("cookie-consent", "rejected");
      localStorage.setItem("analytics-consent", "false");

      setShowBanner(false);
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEssentialOnly = () => {
    // Same as reject but with clearer intent
    handleReject();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 duration-500">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Banner content */}
      <div className="relative bg-inn-bg-card border-t border-inn-border-light shadow-2xl">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="rounded-full bg-inn-bg-accent/10 p-3 flex-shrink-0">
              <Cookie className="h-6 w-6 text-inn-bg-accent" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Cookie & Privacy Preferences</h3>
              <p className="text-sm text-inn-text-secondary mb-4 max-w-3xl">
                We use <strong>essential cookies</strong> to operate our service (authentication, session management).
                We also use <strong>optional analytics cookies</strong> to improve your experience. You have full
                control - choose your preferences below.
              </p>

              {/* Cookie details */}
              <details className="text-sm text-inn-text-secondary mb-4">
                <summary className="cursor-pointer hover:text-inn-text-primary font-medium mb-2">
                  What cookies do we use?
                </summary>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>
                    <strong>Essential:</strong> Authentication, encryption keys, session management (always active)
                  </li>
                  <li>
                    <strong>Analytics (optional):</strong> Usage patterns, feature performance, error tracking
                  </li>
                  <li>
                    <strong>We DO NOT:</strong> Sell your data, use tracking pixels, or share data with advertisers
                  </li>
                </ul>
              </details>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="rounded-2xl bg-inn-bg-accent text-white hover:opacity-90 transition shadow-lg"
                >
                  {isLoading ? "Saving..." : "Accept All"}
                </Button>

                <Button
                  onClick={handleEssentialOnly}
                  disabled={isLoading}
                  variant="outline"
                  className="rounded-2xl border-inn-border-light hover:border-inn-bg-accent hover:text-inn-bg-accent transition"
                >
                  Essential Only
                </Button>

                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  variant="ghost"
                  className="rounded-2xl text-inn-text-secondary hover:text-inn-text-primary"
                >
                  Reject All Optional
                </Button>
              </div>

              <p className="text-xs text-inn-text-secondary mt-3">
                You can change your preferences anytime in{" "}
                <Link href="/settings" className="text-inn-bg-accent hover:underline">
                  Privacy Settings
                </Link>
                . By continuing to use Innuora, you agree to our{" "}
                <Link href="/privacy" className="text-inn-bg-accent hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
