import Link from "next/link";
import { CircleAlertIcon, MailIcon, RefreshCcwIcon } from "lucide-react";

export default async function EmailValidationResendRoute() {
  return (
    <main className="relative flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* <!-- Email Icon --> */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-mir-bg-soft border border-mir-bg-accent/25 flex items-center justify-center">
            <MailIcon className="size-8 text-mir-bg-accent " strokeWidth={2} />
          </div>
        </div>

        {/* <!-- Header --> */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3">
            Resend verification email
          </h1>
          <p className="text-mir-text-secondary">Enter your email address to receive a new verification link</p>
        </div>

        {/* <!-- Common Issues --> */}
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-6 shadow-[0_2px_8px] shadow-black/5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Before requesting a new email...</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
              <span className="text-mir-text-secondary">Check your spam or junk mail folder</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
              <span className="text-mir-text-secondary">Make sure you entered the correct email address</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
              <span className="text-mir-text-secondary">Wait a few minutes - emails can sometimes be delayed</span>
            </div>
          </div>
        </div>

        {/* <!-- Resend Form --> */}
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_4px_20px] shadow-black/8">
          <form id="resendForm" className="space-y-6">
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
              <p className="text-xs text-mir-text-secondary mt-1">
                This should be the same email you used when signing up
              </p>
            </div>

            {/* <!-- Rate Limiting Notice --> */}
            <div id="rateLimitNotice" className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15 hidden">
              <div className="flex items-start gap-3">
                <CircleAlertIcon className="size-4 text-mir-bg-accent" strokeWidth={2} />

                <div>
                  <p className="text-sm font-medium text-mir-text-primary">Rate limit reached</p>
                  <p className="text-xs text-mir-text-secondary mt-1">
                    You can request a new verification email in{" "}
                    <span id="cooldownTime" className="font-semibold">
                      60
                    </span>{" "}
                    seconds
                  </p>
                </div>
              </div>
            </div>

            {/* <!-- Submit Button --> */}
            <button
              type="submit"
              id="resendBtn"
              className="w-full rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mir-bgbg-mir-bg-accent focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="flex items-center justify-center gap-2">
                <RefreshCcwIcon className="size-4 shrink-0" strokeWidth={2} />
                Send verification email
              </span>
            </button>
          </form>
        </div>

        {/* <!-- Alternative Actions --> */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-sm text-mir-text-secondary">
            Still having trouble?
            <Link href="mailto:support@mirael.app" className="text-mir-bg-accent hover:underline">
              Contact support
            </Link>
          </p>
          <p className="text-sm text-mir-text-secondary">
            Want to try a different email?
            <Link href="#" className="text-mir-bg-accent hover:underline">
              Create new account
            </Link>
          </p>
          <p className="text-sm text-mir-text-secondary">
            Already verified?
            <Link href="#" className="text-mir-bg-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
