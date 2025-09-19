import { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "lucide-react";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Check Your Email - Mirael",
  description: "We've sent a verification email to complete your Mirael account setup.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VerificationEmailSentRoute() {
  const user = await findCurrentUser();

  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();

  console.log(data);

  return (
    <main className="relative flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg text-center">
        {/* <!-- Email Icon --> */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-mir-bg-soft border border-mir-bg-accent/25 flex items-center justify-center animate-pulse">
            <MailIcon className="size-8 text-mir-bg-accent " strokeWidth={2} />
          </div>
        </div>

        {/* <!-- Main Message --> */}
        {user?.email && (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4">Check your email</h1>
            <p className="text-lg text-mir-text-secondary mb-2">We've sent a verification link to:</p>
            <p className="text-mir-bg-accent font-semibold text-lg" id="userEmail">
              {user?.email}
            </p>
          </div>
        )}

        {/* <!-- Instructions Card --> */}
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-[0_4px_20px] shadow-black/8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-mir-bg-accent text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-mir-text-secondary">
                  Look for an email from Mirael with the subject "Verify your account"
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-mir-bg-accent text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Click the verification link</p>
                <p className="text-sm text-mir-text-secondary">This will activate your account and log you in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-mir-bg-accent text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Start reflecting</p>
                <p className="text-sm text-mir-text-secondary">
                  Begin your journey of emotional clarity and self-discovery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Resend and Support --> */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="resendBtn"
              className="inline-flex justify-center items-center gap-2 rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Resend email
            </button>
            <Link
              href="#"
              className="inline-flex justify-center items-center gap-2 rounded-2xl border border-mir-border-light px-6 py-3 font-semibold text-mir-text-primary hover:text-mir-bg-accent hover:border-mir-bg-accent transition"
            >
              Need help?
            </Link>
          </div>

          <p className="text-sm text-mir-text-secondary">
            Didn't receive the email? Check your spam folder or
            <Link href="#" className="text-mir-bg-accent hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>

        {/* <!-- Timer Display --> */}
        <div className="mt-8 p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
          <p className="text-sm text-mir-text-secondary">
            You can request a new email in{" "}
            <span id="countdown" className="font-semibold text-mir-text-primary">
              60
            </span>{" "}
            seconds
          </p>
        </div>
      </div>
    </main>
  );
}
