import { Suspense } from "react";
import { notFound } from "next/navigation";

import Footer from "@/components/footer";
import Header from "@/components/header";
import JoinPage, { JoinPageData } from "@/components/tester/join-page";
import initTranslations, { AppLocales } from "@/lib/i18n";

export default async function TesterJoinRoute({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale = "en" } = await params;
  const { t } = await initTranslations(locale, ["pages"]);

  const pageData = t("advancedTester", { returnObjects: true, defaultValue: "" }) as JoinPageData | undefined;

  if (!pageData) {
    return notFound();
  }
  return (
    <main className="min-h-screen standalone:min-h-screen-safe w-screen standalone:w-full">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <JoinPage className="" pageData={pageData} />
      </Suspense>
      <Footer locale={locale as AppLocales} />
    </main>
  );
}
