import { Suspense } from "react";

import LoadingComponent from "@/components/loading-component";
import SessionDecrypt from "@/components/sessions/session-decryptor";
import SessionDetailsPage from "@/components/sessions/session-details";

export default async function SessionDetailsRoute({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;

  return (
    <main className="h-screen w-screen relative standalone:w-full standalone:h-full">
      <Suspense fallback={<LoadingComponent />}>
        <SessionDecrypt publicId={sessionId} content={SessionDetailsPage} />
      </Suspense>

      <Suspense fallback={<LoadingComponent />}></Suspense>
    </main>
  );
}
