import { Suspense } from "react";
import dynamic from "next/dynamic";

//import OnboardingSession from "@/components/sessions/onboarding-session";
import { SESSIONS_IDS } from "@/domains/session-flow/constants/sessions.props";
import { loadSessionFlow } from "@/domains/session-flow/utils/load-session-flow";
import { AppLocales } from "@/lib/i18n";

const SESSION_ID = SESSIONS_IDS.ONBOARDING_SESSION;

const OnboardingSession = dynamic(() => import("@/components/sessions/onboarding-session"), {});

// export function generateStaticParams() {
//   return i18nConfig.locales.map((locale) => ({ locale }));
// }

export default async function OnboardingRoute({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale = "en" } = await params;

  const sessionData = await loadSessionFlow(SESSION_ID, locale as AppLocales);

  return (
    <main className="min-h-screen w-screen standalone:w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <OnboardingSession sessionFlow={sessionData} />
      </Suspense>
    </main>
  );
}
