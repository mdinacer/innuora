import { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Offline - ${APP_CONFIG.name}`,
  description: "You are currently offline. Please check your connection and try again.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-inn-bg-primary px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-inn-bg-soft">
            <WifiOff className="h-8 w-8 text-inn-text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-inn-text-primary mb-2">You're Offline</h1>
          <p className="text-inn-text-secondary">
            It looks like you've lost your internet connection. {APP_CONFIG.name} needs an internet connection to
            provide AI-powered emotional support.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            // onClick={() => window.location.reload()}
            className="w-full bg-inn-bg-accent hover:bg-inn-bg-accent-dark text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <div className="text-sm text-inn-text-secondary">
            <p className="mb-2">While you're offline, you can:</p>
            <ul className="space-y-1 text-left">
              <li>• Review your cached session history</li>
              <li>• Read any downloaded insights</li>
              <li>• Prepare thoughts for your next conversation</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-inn-border-light">
            <p className="text-sm text-inn-text-secondary mb-3">
              Once you're back online, you can continue your emotional clarity journey.
            </p>
            <Link
              href="/en"
              className="inline-flex items-center text-inn-bg-accent hover:text-inn-bg-accent-dark font-medium"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
