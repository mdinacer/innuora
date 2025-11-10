import { Metadata } from "next";
import Link from "next/link";
import { MailIcon, RefreshCcwIcon } from "lucide-react";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Check Your Email - ${APP_CONFIG.name}`,
  description: `We've sent a verification email to complete your ${APP_CONFIG.name} account setup.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VerificationEmailSentRoute() {
  const user = await findCurrentUser();

  return (
    <main className="relative flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg text-center">
        {/* <!-- Email Icon --> */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted border border-primary/25 flex items-center justify-center animate-pulse">
            <MailIcon className="size-8 text-primary " strokeWidth={2} />
          </div>
        </div>

        {/* <!-- Main Message --> */}
        {user?.email && (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4">Check your email</h1>
            <p className="text-lg text-muted-foreground mb-2">We've sent a verification link to:</p>
            <p className="text-primary font-semibold text-lg" id="userEmail">
              {user?.email}
            </p>
          </div>
        )}

        {/* <!-- Instructions Card --> */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[0_4px_20px] shadow-black/8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  Look for an email from Innuora with the subject "Verify your account"
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Click the verification link</p>
                <p className="text-sm text-muted-foreground">This will activate your account and log you in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Start reflecting</p>
                <p className="text-sm text-muted-foreground">
                  Begin your journey of emotional clarity and self-discovery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Resend and Support --> */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button>
              <RefreshCcwIcon className="size-4 shrink-0" />
              Resend email
            </Button>

            <Link
              href="#"
              className="inline-flex justify-center items-center gap-2 rounded-2xl border border-border px-6 py-3 font-semibold text-foreground hover:text-primary hover:border-primary transition"
            >
              Need help?
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or
            <Link href="#" className="text-primary hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>

        {/* <!-- Timer Display --> */}
        <div className="mt-8 p-4 rounded-xl bg-muted border border-primary/15">
          <p className="text-sm text-muted-foreground">
            You can request a new email in{" "}
            <span id="countdown" className="font-semibold text-foreground">
              60
            </span>{" "}
            seconds
          </p>
        </div>
      </div>
    </main>
  );
}
