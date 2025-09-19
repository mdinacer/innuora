import { Metadata } from "next";

import SignInForm from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In - Mirael",
  description: "Sign in to your Mirael account to continue your emotional clarity and self-reflection journey.",
  keywords: [
    "Mirael sign in",
    "login",
    "account access",
    "emotional AI",
    "self-reflection login",
    "burnout recovery app",
    "emotional clarity login",
  ],
  alternates: {
    canonical: "https://www.mirael.life/en/auth/sign-in",
    languages: {
      en: "https://www.mirael.life/en/auth/sign-in",
      fr: "https://www.mirael.life/fr/auth/sign-in",
      ar: "https://www.mirael.life/ar/auth/sign-in",
    },
  },
  openGraph: {
    title: "Sign In to Mirael",
    description: "Continue your emotional clarity journey with Mirael.",
    url: "https://www.mirael.life/en/auth/sign-in",
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
