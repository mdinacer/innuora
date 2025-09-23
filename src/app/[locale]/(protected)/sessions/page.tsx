import { Suspense } from "react";

import Header from "@/components/header";
import LoadingComponent from "@/components/loading-component";
import SessionsPage from "@/components/sessions/sessions-page";
import { AppLocales } from "@/lib/i18n";

export default async function SessionsRoute({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale = "en" } = await params;
  return (
    <main className="relative h-screen w-screen standalone:w-full">
      <Suspense fallback={<LoadingComponent />}>
        <Header />
        <SessionsPage />
      </Suspense>
    </main>
  );
}
