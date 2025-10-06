import { Suspense } from "react";
import { Metadata } from "next";

import JoinPage from "@/components/tester/join-page";
import JoinPageSuccess from "@/components/tester/join-page-success";
import { APP_CONFIG } from "@/config/app";
import { AppLocales } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `Join Beta - ${APP_CONFIG.tagline} | ${APP_CONFIG.name}`,
  description: `Get early access to ${APP_CONFIG.name}, the AI emotional companion for high-functioning women. Join the beta program for burnout recovery, emotional clarity, and overwhelm support.`,
  keywords: [
    "emotional burnout support beta",
    "women burnout recovery app beta",
    "high-functioning women support beta",
    "AI emotional companion beta",
    "emotional overwhelm relief beta",
    "perfectionist burnout help beta",
    "safe space for women beta",
    "emotional clarity app beta",
    "support for overwhelmed women beta",
    "emotional companion for women beta",
  ],
  alternates: {
    canonical: `${APP_CONFIG.domains.primary}/en/join`,
    languages: {
      fr: `${APP_CONFIG.domains.primary}/fr/join`,
      ar: `${APP_CONFIG.domains.primary}/ar/join`,
      "x-default": `${APP_CONFIG.domains.primary}/en/join`,
    },
  },
};

export default async function TesterJoinRoute({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status: string }>;
}>) {
  const { locale } = await params;
  const { status = "error" } = (await searchParams) as { status: "success" | "error" };

  return (
    <main className="min-h-screen  mt-20 standalone:min-h-screen-safe w-screen standalone:w-full">
      <Suspense fallback={<div>Loading...</div>}>
        {status && status === "success" ? (
          <JoinPageSuccess className="" locale={locale as AppLocales} />
        ) : (
          <JoinPage className="" />
        )}
      </Suspense>
    </main>
  );
}
