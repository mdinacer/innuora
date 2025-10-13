import Link from "next/link";
import { redirect } from "next/navigation";

import { APP_CONFIG } from "@/config/app";
import { createClient } from "@/lib/supabase/server";

export default async function AppLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users to sessions page
  if (user) {
    redirect(`/${locale}/sessions`);
  }

  // Show landing page for unauthenticated users
  return (
    <main className="relative font-sans rtl:font-arabic-body rtl:text-lg min-h-screen pt-20 w-screen standalone:w-full overflow-hidden bg-inn-bg-primary transition-all duration-300 ease-in text-inn-text-primary">
      <section className="relative max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl rtl:md:text-7xl font-extrabold leading-tight rtl:leading-normal tracking-tight mb-6 rtl:font-arabic">
            {APP_CONFIG.name}
          </h1>
          <p className="text-xl md:text-2xl text-inn-text-secondary max-w-2xl mx-auto mb-12">
            Your private space for emotional reflection and clarity
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link
            href={`/${locale}/auth/sign-in`}
            className="inline-flex justify-center rounded-2xl border border-inn-border-light bg-transparent rtl:pt-4 px-8 py-4 text-lg font-semibold text-inn-text-primary hover:text-inn-bg-accent hover:border-inn-bg-accent transition-all"
          >
            Sign In
          </Link>
          <Link
            href={`/${locale}/auth/sign-up`}
            className="inline-flex justify-center rtl:pt-4 rounded-2xl bg-inn-bg-accent px-8 py-4 text-lg text-white font-semibold shadow hover:translate-y-[-1px] transition"
          >
            Create Account
          </Link>
        </div>

        <p className="text-sm text-inn-text-secondary">
          New to {APP_CONFIG.name}?{" "}
          <a
            href="https://www.innuora.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-inn-bg-accent hover:underline"
          >
            Learn more
          </a>
        </p>
      </section>

      <section className="relative max-w-3xl mx-auto px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-black/5 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Private & Secure</h3>
            <p className="text-sm text-inn-text-secondary">End-to-end encrypted conversations</p>
          </div>
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-black/5 text-center">
            <div className="text-3xl mb-3">💭</div>
            <h3 className="text-lg font-semibold mb-2">Reflective AI</h3>
            <p className="text-sm text-inn-text-secondary">Emotionally attuned conversations</p>
          </div>
          <div className="rounded-2xl border border-inn-border-light bg-inn-bg-card p-6 shadow-[0_2px_8px] shadow-black/5 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-inn-text-secondary">See patterns and insights over time</p>
          </div>
        </div>
      </section>
    </main>
  );
}
