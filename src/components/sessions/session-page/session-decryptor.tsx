"use client";

import React, { useCallback, useEffect, useState } from "react";

import LoadingComponent from "@/components/loading-component";
import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";

interface Props {
  publicId: string;
  content: React.ComponentType<{ session: Session }>;
}

const SessionDecrypt: React.FC<Props> = ({ publicId, content: Content }) => {
  const [session, setSession] = useState<Session | null>(null);
  const hasHydrated = useEncryptedSessionStore((state) => state.hasHydrated);

  const handleLoadSession = useCallback(async () => {
    const sessionId = useEncryptedSessionStore.getState().publicIdMap[publicId];
    if (!sessionId) return;
    const decryptedSession = await useEncryptedSessionStore.getState().getSession(sessionId);
    if (!decryptedSession) return;
    setSession(decryptedSession);
  }, [publicId]);

  useEffect(() => {
    if (hasHydrated) {
      handleLoadSession();
    }
  }, [handleLoadSession, hasHydrated]);

  if (!hasHydrated) {
    return <LoadingComponent />;
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  return <Content session={session} />;
};

export default SessionDecrypt;
