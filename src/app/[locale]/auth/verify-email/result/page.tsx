import Link from "next/link";
import { CheckIcon, HomeIcon, RefreshCwIcon, XCircleIcon } from "lucide-react";

export default async function EmailValidationResultRoute({
  searchParams,
}: {
  searchParams: Promise<{ status: string }>;
}) {
  const { status = "error" } = (await searchParams) as { status: "success" | "error" };

  return (
    <main className="relative flex items-center justify-center px-6 py-12">
      {status === "success" ? (
        <div className="w-full max-w-lg text-center">
          {/* <!-- Success Icon --> */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckIcon className="size-8 text-green-600" strokeWidth={2} />
            </div>
          </div>

          {/* <!-- Success Message --> */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4">Account verified!</h1>
            <p className="text-lg text-mir-text-secondary">
              Your email has been successfully verified. Welcome to Mirael!
            </p>
          </div>

          {/* <!-- Welcome Card --> */}
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card mb-6">
            <h2 className="text-xl font-semibold mb-4">You're all set</h2>
            <p className="text-mir-text-secondary mb-6">
              Your account is now active and ready to use. Start your journey of emotional reflection and clarity.
            </p>

            <div className="flex flex-col items-center sm:flex-row gap-3 w-full">
              <Link
                href="/"
                className="inline-flex  w-full justify-center items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg"
              >
                <HomeIcon className="size-4 shrink-0" strokeWidth={2} />
                Go to Home
              </Link>
            </div>
          </div>

          {/* <!-- Privacy Reminder --> */}
          <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
            <p className="text-sm text-mir-text-secondary">
              <strong>Privacy First:</strong> Your reflections and conversations are private by default and under your
              control.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg text-center">
          {/* <!-- Error Icon --> */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center shake">
              <XCircleIcon className="size-8 text-red-600 shrink-0" strokeWidth={2} />
            </div>
          </div>

          {/* <!-- Error Message --> */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Verification failed
            </h1>
            <p className="text-lg text-mir-text-secondary" id="errorMessage">
              The verification link is invalid or has expired.
            </p>
          </div>

          {/* <!-- Error Details Card --> */}
          <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card mb-6">
            <h2 className="text-xl font-semibold mb-4">What went wrong?</h2>
            <div className="text-left space-y-3 text-mir-text-secondary mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
                <span>The verification link may have expired (links expire after 24 hours)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
                <span>The link may have been used already</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-mir-bg-accent mt-2 flex-shrink-0"></div>
                <span>There might be a technical issue</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mx-auto">
              <Link
                href="/auth/verify-email/resend"
                className="inline-flex justify-center flex-1 items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-50"
              >
                <RefreshCwIcon className="size-4 shrink-0" strokeWidth={2} />
                Send New Link
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex justify-center items-center gap-2 rounded-2xl border border-mir-border-light px-6 py-3 font-semibold text-mir-text-primary hover:text-mir-bg-accent hover:border-mir-bg-accent transition"
              >
                Go back to Sign Up
              </Link>
            </div>
          </div>

          {/* <!-- Help Section --> */}
          <div className="p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
            <p className="text-sm text-mir-text-secondary">
              Still having trouble? Email us at
              <a href="mailto:support@mirael.life" className="text-mir-bg-accent hover:underline">
                support@mirael.life
              </a>
              and we'll help you get verified.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
