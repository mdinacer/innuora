/**
 * Dynamic component loaders for bundle optimization
 * These components are loaded on-demand to reduce initial bundle size
 */

import dynamic from "next/dynamic";

// Loading fallback component
const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center p-4 ${className}`}>
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-inn-primary" />
  </div>
);

// Background effects - not critical for initial load
export const BackgroundBeams = dynamic(() => import("@/components/background-beams"), {
  loading: () => null, // No loading state needed for background effect
});

// Heavy session components (biggest bundle impact)
export const SessionPage = dynamic(() => import("@/components/sessions/session-page"), {
  loading: () => <LoadingSpinner className="h-96" />,
});

export const SessionDetails = dynamic(() => import("@/components/sessions/session-details"), {
  loading: () => <LoadingSpinner className="h-64" />,
});

export const OpenChat = dynamic(
  () => import("@/components/chat-interface").then((mod) => ({ default: mod.OpenChat })),
  {
    loading: () => <LoadingSpinner className="h-96" />,
  }
);

export const FlowChat = dynamic(
  () => import("@/components/chat-interface").then((mod) => ({ default: mod.FlowChat })),
  {
    loading: () => <LoadingSpinner className="h-96" />,
  }
);

// Mood tracking components
export const MoodCheckIn = dynamic(
  () => import("@/components/mood/mood-check-in").then((mod) => ({ default: mod.MoodCheckIn })),
  {
    loading: () => <LoadingSpinner className="h-64" />,
  }
);

export const MoodDashboard = dynamic(
  () => import("@/components/mood/mood-dashboard").then((mod) => ({ default: mod.MoodDashboard })),
  {
    loading: () => <LoadingSpinner className="h-64" />,
  }
);

// Form components - loaded when needed
export const SessionForm = dynamic(() => import("@/components/sessions/session-form"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-md"></div>,
});

export const SignUpForm = dynamic(() => import("@/components/auth/sign-up-form"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-md"></div>,
});

export const SignInForm = dynamic(() => import("@/components/auth/sign-in-form"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-md"></div>,
});

// Billing components (Stripe integration)
export const BillingManagement = dynamic(() => import("@/components/billing/billing-management"), {
  loading: () => <LoadingSpinner className="h-96" />,
});

// Settings page
export const SettingsPage = dynamic(() => import("@/components/settings/settings-page"), {
  loading: () => <LoadingSpinner className="h-96" />,
});

// Credit management components
export const CreditsBalance = dynamic(() => import("@/components/credits/credits-balance"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>,
});

export const CreditsTransactionHistory = dynamic(() => import("@/components/credits/credits-transaction-history"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-md"></div>,
});

// Export collections for easier imports
export const DynamicPages = {
  SessionPage,
  SessionDetails,
  BillingManagement,
  SettingsPage,
};

export const DynamicChat = {
  OpenChat,
  FlowChat,
};

export const DynamicMood = {
  MoodCheckIn,
  MoodDashboard,
};

export const DynamicForms = {
  SessionForm,
  SignUpForm,
  SignInForm,
};

export const DynamicCredits = {
  CreditsBalance,
  CreditsTransactionHistory,
};

export const DynamicEffects = {
  BackgroundBeams,
};
