"use client";

import { createSession } from "@/app/actions/session-actions";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/domains/guidance-flow/stores/sessions-store";
import { SessionMetadataSchema } from "@/domains/guidance-flow/types/session-runtime";
import { EncryptedSession } from "@/domains/guidance-flow/types/session-server";
import { SessionCreate } from "@/lib/zod/session-create.schema";
import { useAppUserStore } from "@/stores/app-user.store";

export default function Page() {
  const user = useAppUserStore((state) => state.user);
  const sessions = useSessionStore((state) => state.sessions);

  const createTestSession = async () => {
    if (!user) return;

    const sessionCreate: SessionCreate = {
      title: "Test",
      subtitle: "New test session",
      autoUpdateTitle: true,
      persistOnCloud: true,
    };

    const sessionCreateResults = await createSession(sessionCreate);
    if (sessionCreateResults.error) {
      throw sessionCreateResults.error;
    }
    if (!sessionCreateResults.data) {
      throw new Error("No session created");
    }
    const { data: createdSession } = sessionCreateResults;
    const newSession: EncryptedSession = {
      id: createdSession.id,
      userId: createdSession.userId,
      title: createdSession.title,
      subtitle: createdSession.subtitle,
      createdAt: createdSession.createdAt,
      updatedAt: createdSession.updatedAt,
      messages: null,
      autoUpdateTitle: createdSession.autoUpdateTitle,

      metadata: createdSession.metadata
        ? SessionMetadataSchema.parse(createdSession.metadata)
        : {
            messageCount: 0,
            creditsUsed: 0,
            activeDurationMs: 0,
            lastActiveAt: undefined,
          },
      persistOnCloud: createdSession.persistOnCloud,
    };
    useSessionStore.getState().addSession(newSession);
  };

  return (
    <main className="relative h-screen w-screen bg-background">
      <div className="absolute top-6 left-6">
        <CodeView data={{ sessions }} />
      </div>
      <Button onClick={createTestSession}>Create test session</Button>
    </main>
  );
}
