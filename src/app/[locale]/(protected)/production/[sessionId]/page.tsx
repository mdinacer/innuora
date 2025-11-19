import { Suspense } from "react";

import LoadingComponent from "@/components/loading-component";
import ActiveSessionBoundary from "@/components/sessions/active-session-boundary";
import SessionPage from "../components/session-page";

export default async function Page({ params }: { params: Promise<{ locale: string; sessionId: string }> }) {
  const { sessionId } = await params;

  return (
    <main className=" min-h-screen w-screen bg-background flex-col flex">
      <Suspense fallback={<LoadingComponent />}>
        <ActiveSessionBoundary publicId={sessionId}>
          <SessionPage />
        </ActiveSessionBoundary>
      </Suspense>
    </main>
  );
}
