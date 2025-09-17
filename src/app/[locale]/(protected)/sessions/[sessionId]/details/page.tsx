import { Suspense } from "react";

import LoadingComponent from "@/components/loading-component";
import SessionDetailsPage from "@/components/sessions/session-page/session-details";
import SessionLoader from "@/components/sessions/session-page/session-loader";

export default async function SessionDetailsRoute({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;

  return (
    <main className="h-screen w-screen relative standalone:w-full standalone:h-full">
      <Suspense fallback={<LoadingComponent />}>
        {/* <SessionPage sessionId={sessionId} /> */}
        <SessionLoader publicId={sessionId} content={SessionDetailsPage} />
      </Suspense>
    </main>
  );
}
