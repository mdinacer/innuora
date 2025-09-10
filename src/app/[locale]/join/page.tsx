import { Suspense } from "react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import JoinPage from "@/components/tester/join-page";
import JoinPageSuccess from "@/components/tester/join-page-success";
import initTranslations, { AppLocales } from "@/lib/i18n";

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
      title: t("advancedTester.hero.title"),
      description: t("advancedTester.hero.description"),
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
        label: t("advancedTester.form.source.label"),
        placeholder: t("advancedTester.form.source.placeholder"),
        helpText: t("advancedTester.form.source.helpText"),
      },
      notes: {
        label: t("advancedTester.form.notes.label"),
        placeholder: t("advancedTester.form.notes.placeholder"),
        helpText: t("advancedTester.form.notes.helpText"),
      },
      submitButton: t("advancedTester.form.submitButton"),
      thankYouNote: t("advancedTester.form.thankYouNote"),
    },
  };

  return (
    <main className="min-h-screen standalone:min-h-screen-safe w-screen standalone:w-full">
      <Header locale={locale as AppLocales} />
      <Suspense fallback={<div>Loading...</div>}>
        {status && status === "success" ? (
          <JoinPageSuccess className="" locale={locale as AppLocales} />
        ) : (
          <JoinPage className="" pageData={pageData} />
        )}
      </Suspense>
      <Footer locale={locale as AppLocales} />
    </main>
  );
}
