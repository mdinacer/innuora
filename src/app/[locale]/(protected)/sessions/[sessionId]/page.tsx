import { Suspense } from "react";

import LoadingComponent from "@/components/loading-component";
import SessionPage from "@/components/sessions/session-page";

export default async function SessionRoute({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;

  return (
    <main className="h-screen w-screen relative standalone:w-full standalone:h-full">
      <Suspense fallback={<LoadingComponent />}>
        <SessionPage obfuscatedSessionId={sessionId} />
      </Suspense>
    </main>
  );
}
