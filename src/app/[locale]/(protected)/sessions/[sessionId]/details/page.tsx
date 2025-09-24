import { Suspense } from "react";

import { DynamicPages } from "@/components/dynamic-loaders";
import LoadingComponent from "@/components/loading-component";
import SessionDecrypt from "@/domains/encrypted-session/components/session-decryptor";

export default async function SessionDetailsRoute({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;

  return (
    <main className="h-screen w-screen relative standalone:w-full standalone:h-full">
      <Suspense fallback={<LoadingComponent />}>
        <SessionDecrypt publicId={sessionId} content={DynamicPages.SessionDetails} />
      </Suspense>
    </main>
  );
}
