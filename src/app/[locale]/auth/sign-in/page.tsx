import { Metadata } from "next";

import SignInForm from "@/components/auth/sign-in-form";
import { APP_CONFIG } from "@/config/app";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale = "en" } = await params;

  return {
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
      canonical: `/${locale}/auth/sign-in`,
      languages: {
        en: "/en/auth/sign-in",
        fr: "/fr/auth/sign-in",
        ar: "/ar/auth/sign-in",
        "x-default": "/en/auth/sign-in",
      },
    },
    openGraph: {
      title: `Sign In to ${APP_CONFIG.name}`,
      description: `Continue your emotional clarity journey with ${APP_CONFIG.name}.`,
      url: `/${locale}/auth/sign-in`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SignInRoute() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-12">
      <SignInForm />
    </main>
  );
}
