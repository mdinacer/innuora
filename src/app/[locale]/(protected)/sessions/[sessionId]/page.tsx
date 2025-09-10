import { redirect } from "next/navigation";

import SessionPage from "@/components/sessions/session-page";

export default async function SessionRoute({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;

  if (!sessionId) {
    redirect("/sessions");
  }

  return (
    <main className="h-screen w-screen relative standalone:w-full standalone:h-full">
      <SessionPage sessionId={sessionId} />
    </main>
  );
}
