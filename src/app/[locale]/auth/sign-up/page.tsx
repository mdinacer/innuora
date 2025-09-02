import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const PASSWORD_STRENGTH: Record<"weak" | "medium" | "strong", { bg: string; width: string }> = {
  weak: { bg: "bg-[#ef4444]", width: "w-1/3" },
  medium: { bg: "bg-[#f59e0b]", width: "w-2/3" },
  strong: { bg: "bg-[#10b981]", width: "w-full" },
};

export default function SignUpRoute() {
  const passwordStrength = PASSWORD_STRENGTH["weak"];
  return (
    <main className="relative flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* <!-- Welcome Header --> */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3">Start your journey</h1>
          <p className="text-mir-text-secondary">Create your account for emotional reflection and clarity</p>
        </div>

        {/* <!-- Sign Up Form --> */}
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card">
          <form id="signupForm" className="space-y-6">
            {/* <!-- Name Field --> */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Your name"
                className="w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 text-mir-text-primary placeholder-mir-text-secondary outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
              />
            </div>

            {/* <!-- Email Field --> */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 text-mir-text-primary placeholder-mir-text-secondary outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
              />
            </div>

            {/* <!-- Password Field --> */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Create a strong password"
                  className="w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 pr-12 text-mir-text-primary placeholder-mir-text-secondary outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
                />
                <button
                  type="button"
                  id="togglePassword"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-mir-text-secondary hover:text-mir-text-primary transition"
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon />
                </button>
              </div>

              {/* <!-- Password Strength Indicator --> */}
              <div className="mt-2">
                <div className="flex space-x-1 mb-1">
                  <div className="flex-1 h-1 bg-mir-border-light rounded-full">
                    <div
                      id="strengthBar"
                      className={cn(
                        "password-strength bg-mir-border-light h-1 rounded-[2px] transition-all duration-300 ease-in-out",
                        passwordStrength.bg,
                        passwordStrength.width
                      )}
                    ></div>
                  </div>
                </div>
                <p id="strengthText" className="text-xs text-[var(--text-secondary)]">
                  Password strength will appear here
                </p>
              </div>
            </div>

            {/* <!-- Confirm Password Field --> */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="Confirm your password"
                  className="w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 pr-12 text-mir-text-primary placeholder-mir-text-secondary outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
                />
                <button
                  type="button"
                  id="toggleConfirmPassword"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-mir-text-secondary hover:text-mir-text-primary transition"
                  aria-label="Toggle password visibility"
                >
                  <EyeOffIcon />
                </button>
              </div>
              <p id="matchText" className="text-xs text-mir-text-secondary mt-1 opacity-0 transition-opacity">
                Passwords match
              </p>
            </div>

            {/* <!-- Age Confirmation --> */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="ageConfirm"
                name="ageConfirm"
                required
                className="mt-1 w-4 h-4 rounded border border-mir-border-light text-mir-bg-accent focus:ring-mir-bg-accent focus:ring-opacity-50"
              />
              <label htmlFor="ageConfirm" className="text-sm text-mir-text-secondary">
                I confirm that I am at least 18 years old and have the legal capacity to enter into this agreement.
              </label>
            </div>

            {/* <!-- Terms Agreement --> */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="termsAgree"
                name="termsAgree"
                required
                className="mt-1 w-4 h-4 rounded border border-mir-border-light text-mir-bg-accent focus:ring-mir-bg-accent focus:ring-opacity-50"
              />
              <label htmlFor="termsAgree" className="text-sm text-mir-text-secondary">
                I agree to the{" "}
                <Link href="#" className="text-mir-bg-accent hover:underline">
                  Terms of Use
                </Link>{" "}
                and
                <Link href="#" className="text-mir-bg-accent hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* <!-- Submit Button --> */}
            <button
              type="submit"
              id="submitBtn"
              disabled
              className="w-full rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Create account
            </button>
          </form>
        </div>

        {/* <!-- Sign In Link --> */}
        <div className="text-center mt-6">
          <p className="text-mir-text-secondary">
            Already have an account?
            <Link href="/auth/sign-in" className="text-mir-bg-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* <!-- Important Notice --> */}
        <div className="mt-8 p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
          <p className="text-sm text-mir-text-secondary text-center">
            <strong>Important:</strong> Mirael is not a mental health or crisis service. If you are in crisis, contact
            local emergency services immediately.
          </p>
        </div>
      </div>
    </main>
  );
}
