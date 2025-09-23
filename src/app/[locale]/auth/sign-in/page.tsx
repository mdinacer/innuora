import { Metadata } from "next";

import SignInForm from "@/components/auth/sign-in-form";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Sign In - ${APP_CONFIG.name}`,
  description: `Sign in to your ${APP_CONFIG.name} account to continue your emotional clarity and self-reflection journey.`,
  keywords: [
    `${APP_CONFIG.name} sign in`,
    "login",
    "account access",
    "emotional AI",
    "self-reflection login",
    "burnout recovery app",
    "emotional clarity login",
  ],
  alternates: {
    canonical: `${APP_CONFIG.domains.primary}/en/auth/sign-in`,
    languages: {
      en: `${APP_CONFIG.domains.primary}/en/auth/sign-in`,
      fr: `${APP_CONFIG.domains.primary}/fr/auth/sign-in`,
      ar: `${APP_CONFIG.domains.primary}/ar/auth/sign-in`,
    },
  },
  openGraph: {
    title: `Sign In to ${APP_CONFIG.name}`,
    description: `Continue your emotional clarity journey with ${APP_CONFIG.name}.`,
    url: `${APP_CONFIG.domains.primary}/en/auth/sign-in`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SignInRoute() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-12">
      <SignInForm />
    </main>
  );
}
