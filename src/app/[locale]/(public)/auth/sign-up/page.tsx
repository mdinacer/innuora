import { Metadata } from "next";

import SignUpForm from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up Free - AI Therapist & Mental Health Support | Mirael",
  description:
    "Create your free account to access AI therapist and mental health support. Join thousands of women getting burnout recovery, anxiety help, and emotional wellness support.",
  keywords: [
    "AI therapist free signup",
    "free AI therapy app",
    "mental health AI registration",
    "therapy chatbot sign up",
    "free emotional support AI",
    "AI counselor create account",
    "burnout recovery app signup",
    "mental health app registration",
    "therapy alternative signup",
    "women mental health app",
    "CBT app registration",
    "anxiety help app signup",
    "Mirael sign up",
    "emotional AI companion",
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
