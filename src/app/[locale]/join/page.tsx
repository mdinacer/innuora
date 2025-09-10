import { Suspense } from "react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import JoinPage from "@/components/tester/join-page";
import JoinPageSuccess from "@/components/tester/join-page-success";
import { AppLocales } from "@/lib/i18n";

export default async function TesterJoinRoute({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status: string }>;
}>) {
  const { locale = "en" } = await params;
  const { status = "error" } = (await searchParams) as { status: "success" | "error" };

  return (
    <main className="min-h-screen standalone:min-h-screen-safe w-screen standalone:w-full">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        {status === "success" ? (
          <JoinPageSuccess className="" locale={locale as AppLocales} />
        ) : (
          <JoinPage className="" />
        )}
      </Suspense>
      <Footer locale={locale as AppLocales} />
    </main>
  );
}
