import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Session } from "@prisma/client";

import { requireCurrentUser } from "@/app/actions/auth-actions";
import SessionPage from "@/components/sessions/session-page";
import { prisma } from "@/lib/prisma";

async function fetchSession(sessionId: string): Promise<Pick<Session, "id" | "updatedAt"> | null> {
  if (!sessionId.trim()) {
    return null;
  }
  const authUser = await requireCurrentUser();

  const session = await prisma.session.findUnique({
    where: { id: sessionId, user: { authId: authUser.id } },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  if (!session) {
    return null;
  }

  return session;
}

export default async function SessionRoute({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = await params;

  const session = await fetchSession(sessionId);

  if (!session) {
    return notFound();
  }

  return (
    <main className="h-screen w-screen relative standalone:w-full standalone:h-full">
      <Suspense fallback={<div>Loading</div>}>
        <SessionPage sessionId={session.id} lastUpdatedAt={session.updatedAt} />
      </Suspense>
    </main>
  );
}
