import { Metadata } from "next";

import SignUpForm from "@/components/auth/sign-up-form";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Create Account - ${APP_CONFIG.tagline} | ${APP_CONFIG.name}`,
  description:
    "Create your free account to access your AI emotional companion. Join high-functioning women gaining emotional clarity, pattern recognition, and overwhelm support.",
  keywords: [
    "emotional burnout support signup",
    "women burnout recovery app signup",
    "high-functioning women support registration",
    "emotional overwhelm relief signup",
    "perfectionist burnout help signup",
    "AI emotional companion signup",
    "safe space for women signup",
    "emotional clarity app registration",
    "support for overwhelmed women signup",
    "emotional companion for women signup",
    `${APP_CONFIG.name} sign up`,
    "women emotional wellness registration",
  ],
  alternates: {
    canonical: `${APP_CONFIG.domains.primary}/en/auth/sign-up`,
    languages: {
      en: `${APP_CONFIG.domains.primary}/en/auth/sign-up`,
      fr: `${APP_CONFIG.domains.primary}/fr/auth/sign-up`,
      ar: `${APP_CONFIG.domains.primary}/ar/auth/sign-up`,
    },
  },
  openGraph: {
    title: `Join ${APP_CONFIG.name} - Start Your Emotional Clarity Journey`,
    description: `Create your free account and begin exploring emotional awareness with ${APP_CONFIG.name}'s AI companion.`,
    url: `${APP_CONFIG.domains.primary}/en/auth/sign-up`,
    images: [
      {
        url: "/og/mirael-cover.png",
        width: 1200,
        height: 630,
        alt: `Join ${APP_CONFIG.name} for emotional clarity`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Join ${APP_CONFIG.name} - Emotional AI Companion`,
    description: `Start your free account and discover emotional clarity with ${APP_CONFIG.name}.`,
    images: ["/og/mirael-cover.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignUpRoute() {
  return (
    <main className="relative flex items-center justify-center px-6 py-12">
      <SignUpForm />
    </main>
  );
}
