import { Suspense } from "react";

import SessionPage from "@/components/sessions/session-page";

export default async function SessionRoute({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;

  return (
    <main className="h-screen w-screen relative standalone:w-full standalone:h-full">
      <Suspense fallback={<div>Loading</div>}>
        <SessionPage sessionId={sessionId} />
      </Suspense>
    </main>
  );
}
