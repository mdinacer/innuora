import { Metadata } from "next";

import SignUpForm from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account - AI Emotional Companion for Women | Mirael",
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
    "Mirael sign up",
    "women emotional wellness registration",
  ],
  alternates: {
    canonical: "https://www.mirael.life/en/auth/sign-up",
    languages: {
      en: "https://www.mirael.life/en/auth/sign-up",
      fr: "https://www.mirael.life/fr/auth/sign-up",
      ar: "https://www.mirael.life/ar/auth/sign-up",
    },
  },
  openGraph: {
    title: "Join Mirael - Start Your Emotional Clarity Journey",
    description: "Create your free account and begin exploring emotional awareness with Mirael's AI companion.",
    url: "https://www.mirael.life/en/auth/sign-up",
    images: [
      {
        url: "/og/mirael-cover.png",
        width: 1200,
        height: 630,
        alt: "Join Mirael for emotional clarity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Mirael - Emotional AI Companion",
    description: "Start your free account and discover emotional clarity with Mirael.",
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
