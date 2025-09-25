import { Suspense } from "react";

import Header from "@/components/header";
import LoadingComponent from "@/components/loading-component";
import SessionsPage from "@/components/sessions/sessions-page";

export default async function SessionsRoute({}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  return (
    <main className="relative h-screen w-screen standalone:w-full">
      <Suspense fallback={<LoadingComponent />}>
        <Header />
        <SessionsPage />
      </Suspense>
    </main>
  );
}
