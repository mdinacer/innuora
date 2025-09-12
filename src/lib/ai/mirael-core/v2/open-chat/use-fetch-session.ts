import { useCallback, useEffect, useMemo, useState } from "react";

import { getSessionById } from "@/app/actions/session-actions";
import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import { Session, SessionMeta, SessionMetadataSchema } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { safeDecrypt } from "@/lib/crypto/encryption";
import { EncryptedDataSchema } from "@/lib/crypto/encryption.types";

export default function useFetchSession({
  sessionId,
  lastUpdatedAt,
}: {
  sessionId: string;
  lastUpdatedAt?: Date | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasHydrated = useOpenChatSessionStore((state) => state.hasHydrated);
  const session = useOpenChatSessionStore((state) => state.getSession(sessionId));

  const shouldFetch = useMemo(() => {
    if (loading) return false;
    if (!hasHydrated) return true; // store not hydrated
    if (!session) return true; // session not in store
    if (!lastUpdatedAt) return false; // no reference timestamp

    // safe check for updatedAt
    if (!session.updatedAt) return true;

    return session.updatedAt < lastUpdatedAt;
  }, [loading, hasHydrated, session, lastUpdatedAt]);

  const handleFetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSessionById(sessionId);
      if (!data) return;

      let fetchedSession: Session = {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle || "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        messages: [],
        memoryStore: null,
        continuitySummary: null,
        aggregatedAnalysis: null,
        analysisSnapshots: [],
        modelCode: data.modelCode || "M1",
        autoUpdateTitle: data.autoUpdateTitle,
        metadata: (data.metadata
          ? { ...SessionMetadataSchema.parse(data.metadata), tokenUsage: [] }
          : { messageCount: 0, tokenCount: 0, costUSD: 0, tokenUsage: [] }) as SessionMeta,
        ...(session ? session : {}),
      };

      const encryptedData = EncryptedDataSchema.safeParse(data);

      if (encryptedData.success) {
        const decryptedData = safeDecrypt<Partial<Session>>(encryptedData.data);
        fetchedSession = { ...fetchedSession, ...decryptedData };
      }

      useOpenChatSessionStore.getState().updateSession(fetchedSession.id, fetchedSession);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to fetch session");
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId, session]);

  useEffect(() => {
    if (!shouldFetch) return;
    handleFetchSession();
  }, [shouldFetch, handleFetchSession]);

  return { session, loading, error };
}
