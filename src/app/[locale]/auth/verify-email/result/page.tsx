import { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, HomeIcon, RefreshCwIcon, XCircleIcon } from "lucide-react";

import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Email Verification Result - ${APP_CONFIG.name}`,
  description: `Your email verification status for your ${APP_CONFIG.name} account.`,
  robots: {
    index: false,
    follow: false,
  },
};

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
            <p className="text-lg text-muted-foreground">
              Your email has been successfully verified. Welcome to Innuora!
            </p>
          </div>

          {/* <!-- Welcome Card --> */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-[0_4px_20px] shadow-black/8 mb-6">
            <h2 className="text-xl font-semibold mb-4">You're all set</h2>
            <p className="text-muted-foreground mb-6">
              Your account is now active and ready to use. Start your journey of emotional reflection and clarity.
            </p>

            <div className="flex flex-col items-center sm:flex-row gap-3 w-full">
              <Link
                href="/"
                className="inline-flex w-full justify-center items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg"
              >
                <HomeIcon className="size-4 shrink-0" strokeWidth={2} />
                Go to Home
              </Link>
            </div>
          </div>

          {/* <!-- Privacy Reminder --> */}
          <div className="p-4 rounded-xl bg-muted border border-primary/15">
            <p className="text-sm text-muted-foreground">
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
            <p className="text-lg text-muted-foreground" id="errorMessage">
              The verification link is invalid or has expired.
            </p>
          </div>

          {/* <!-- Error Details Card --> */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-[0_4px_20px] shadow-black/8 mb-6">
            <h2 className="text-xl font-semibold mb-4">What went wrong?</h2>
            <div className="text-left space-y-3 text-muted-foreground mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>The verification link may have expired (links expire after 24 hours)</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>The link may have been used already</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span>There might be a technical issue</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mx-auto">
              <Link
                href="/auth/verify-email/resend"
                className="inline-flex justify-center flex-1 items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              >
                <RefreshCwIcon className="size-4 shrink-0" strokeWidth={2} />
                Send New Link
              </Link>
              <Link
                href="/auth/sign-up"
                className="inline-flex justify-center items-center gap-2 rounded-2xl border border-border px-6 py-3 font-semibold text-foreground hover:text-primary hover:border-primary transition"
              >
                Go back to Sign Up
              </Link>
            </div>
          </div>

          {/* <!-- Help Section --> */}
          <div className="p-4 rounded-xl bg-muted border border-primary/15">
            <p className="text-sm text-muted-foreground">
              Still having trouble? Email us at
              <Link href={`"mailto:${APP_CONFIG.contact.support}"`} className="text-primary hover:underline">
                {APP_CONFIG.contact.support}
              </Link>
              and we'll help you get verified.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
