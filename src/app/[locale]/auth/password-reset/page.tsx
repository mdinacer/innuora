import { Metadata } from "next";
import Link from "next/link";

import PasswordResetForm from "@/components/auth/password-reset-form";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Reset Password - ${APP_CONFIG.name}`,
  description: `Reset your ${APP_CONFIG.name} account password to regain access to your emotional clarity journey.`,
  keywords: [
    `${APP_CONFIG.name} password reset`,
    "forgot password",
    "account recovery",
    "reset login",
    "emotional AI access",
  ],
  alternates: {
    canonical: `${APP_CONFIG.domains.primary}/en/auth/password-reset`,
    languages: {
      en: `${APP_CONFIG.domains.primary}/en/auth/password-reset`,
      fr: `${APP_CONFIG.domains.primary}/fr/auth/password-reset`,
      ar: `${APP_CONFIG.domains.primary}/ar/auth/password-reset`,
    },
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ResetPasswordRoute() {
  return (
    <main className="relative flex items-center flex-1 justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* <!-- Header --> */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3">Reset your password</h1>
          <p className="text-inn-text-secondary">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* <!-- Request Form --> */}
        <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-8 shadow-md">
          <PasswordResetForm />
        </div>

        {/* <!-- Back to Sign In --> */}
        <div className="text-center mt-6">
          <p className="text-inn-text-secondary inline-flex gap-x-2">
            Remember your password?
            <Link href="/auth/sign-in" className="text-inn-bg-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
