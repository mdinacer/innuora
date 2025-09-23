/**
 * Dynamic component loaders for bundle optimization
 * These components are loaded on-demand to reduce initial bundle size
 */

import dynamic from "next/dynamic";

// Background effects - not critical for initial load
export const BackgroundBeams = dynamic(() => import("@/components/background-beams"), {
  loading: () => null, // No loading state needed for background effect
});

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

// Credit management components
export const CreditsBalance = dynamic(() => import("@/components/credits/credits-balance"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>,
});

export const CreditsTransactionHistory = dynamic(() => import("@/components/credits/credits-transaction-history"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-md"></div>,
});

// Export collections for easier imports
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
