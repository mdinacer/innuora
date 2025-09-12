import { useCallback, useEffect, useMemo, useState } from "react";
import { Session as PrismaSession } from "@prisma/client";

import { listSessionsByUser } from "@/app/actions/session-actions";
import { useOpenChatSessionStore } from "../ai/mirael-core/v2/open-chat-session.store";
import { PersistedSessionData, persistedSessionToSession, Session } from "../ai/mirael-core/v2/open-chat-session.types";
import { decryptData } from "../crypto/  session-encryption";

export default function useFetchSessions() {
  const [loading, setLoading] = useState(false);
  const hasHydrated = useOpenChatSessionStore((state) => state.hasHydrated);
  const sessions = useOpenChatSessionStore((state) => state.sessions);

  const shouldFetch = useMemo(
    () => hasHydrated && Object.keys(sessions).length === 0 && !loading,
    [hasHydrated, loading, sessions]
  );

  const handleDecryptSession = useCallback((sessionsData: PrismaSession) => {
    if (!sessionsData) return;
    const decryptedSession = decryptData<PrismaSession, Partial<PersistedSessionData>>(sessionsData);
    return decryptedSession;
  }, []);

  const handleFetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSessionsByUser();
      const decryptedSessions = data.map((session) => {
        const decryptedSession = handleDecryptSession(session);

        return {
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          ...(decryptedSession ? persistedSessionToSession(decryptedSession) : {}),
        } as Session;
      });

      const parsedSession: Record<string, Session> = Object.fromEntries(
        decryptedSessions.map((session) => [session.id, session])
      );

      console.log("parsedSession", parsedSession);

      useOpenChatSessionStore.setState({ sessions: parsedSession });
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [handleDecryptSession]);

  useEffect(() => {
    if (shouldFetch) {
      handleFetchSessions();
    }
  }, [handleFetchSessions, shouldFetch]);

  return { sessions, loading, hasHydrated };
}
