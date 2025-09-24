import { Suspense } from "react";
import { Metadata } from "next";

import JoinPage from "@/components/tester/join-page";
import JoinPageSuccess from "@/components/tester/join-page-success";
import { APP_CONFIG } from "@/config/app";
import initTranslations, { AppLocales } from "@/lib/i18n";

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
  const { t } = await initTranslations(locale, ["pages"]);

  const pageData = {
    hero: {
      badge: t("advancedTester.hero.badge"),
      title: t("advancedTester.hero.title", { app_name: APP_CONFIG.name }),
      description: t("advancedTester.hero.description", { app_name: APP_CONFIG.name }),
    },
    form: {
      email: {
        label: t("advancedTester.form.email.label"),
        placeholder: t("advancedTester.form.email.placeholder"),
        required: t("advancedTester.form.email.required"),
      },
      occupation: {
        label: t("advancedTester.form.occupation.label"),
        placeholder: t("advancedTester.form.occupation.placeholder"),
        helpText: t("advancedTester.form.occupation.helpText"),
      },
      struggles: {
        label: t("advancedTester.form.struggles.label"),
        placeholder: t("advancedTester.form.struggles.placeholder"),
        helpText: t("advancedTester.form.struggles.helpText"),
      },
      coping: {
        label: t("advancedTester.form.coping.label"),
        placeholder: t("advancedTester.form.coping.placeholder"),
        helpText: t("advancedTester.form.coping.helpText"),
      },
      source: {
        label: t("advancedTester.form.source.label", { app_name: APP_CONFIG.name }),
        placeholder: t("advancedTester.form.source.placeholder"),
        helpText: t("advancedTester.form.source.helpText"),
      },
      notes: {
        label: t("advancedTester.form.notes.label"),
        placeholder: t("advancedTester.form.notes.placeholder", { app_name: APP_CONFIG.name }),
        helpText: t("advancedTester.form.notes.helpText"),
      },
      submitButton: t("advancedTester.form.submitButton"),
      thankYouNote: t("advancedTester.form.thankYouNote", { app_name: APP_CONFIG.name }),
    },
    messages: {
      success: t("advancedTester.messages.success"),
      pending: t("advancedTester.messages.pending"),
      error: t("advancedTester.messages.error"),
    },
  };

  return (
    <main className="min-h-screen  mt-20 standalone:min-h-screen-safe w-screen standalone:w-full">
      {/* <Header className="sticky top-0 standalone:pt-safe standalone:inset-x-safe inset-x-0 backdrop-blur-md backdrop-saturate-150 bg-mir-bg-card/50" /> */}
      <Suspense fallback={<div>Loading...</div>}>
        {status && status === "success" ? (
          <JoinPageSuccess className="" locale={locale as AppLocales} />
        ) : (
          <JoinPage className="" pageData={pageData} />
        )}
      </Suspense>
      {/* <Footer locale={locale as AppLocales} /> */}
    </main>
  );
}
