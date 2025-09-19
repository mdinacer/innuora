import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password - Mirael",
  description: "Reset your Mirael account password to regain access to your emotional clarity journey.",
  keywords: ["Mirael password reset", "forgot password", "account recovery", "reset login", "emotional AI access"],
  alternates: {
    canonical: "https://www.mirael.life/en/auth/password-reset",
    languages: {
      en: "https://www.mirael.life/en/auth/password-reset",
      fr: "https://www.mirael.life/fr/auth/password-reset",
      ar: "https://www.mirael.life/ar/auth/password-reset",
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
          <p className="text-mir-text-secondary">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* <!-- Request Form --> */}
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-md">
          <form id="resetRequestForm" className="space-y-6">
            {/* <!-- Email Field --> */}
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                id="resetEmail"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 text-mir-text-primary placeholder-mir-text-secondary outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
              />
            </div>

            {/* <!-- Submit Button --> */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-50"
            >
              Send reset link
            </button>
          </form>
        </div>

        {/* <!-- Back to Sign In --> */}
        <div className="text-center mt-6">
          <p className="text-mir-text-secondary">
            Remember your password?
            <Link href="/auth/sign-in" className="text-mir-bg-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
