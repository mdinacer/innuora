"use client";

import React, { useCallback, useEffect, useState } from "react";

import LoadingComponent from "@/components/loading-component";
import { useSessionStore } from "@/domains/session-persistence";
import { decryptSession } from "@/domains/session-persistence/session-persistence.utils";
import { ConversationSession as Session } from "@/domains/session-state/session-state.types";

interface Props {
  publicId: string;
  content: React.ComponentType<{ session: Session }>;
}

const SessionDecrypt: React.FC<Props> = ({ publicId, content: Content }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);

  const handleLoadSession = useCallback(async () => {
    const sessionStore = useSessionStore.getState();

    setIsLoading(true);
    setError(null);
    setSession(null);

    try {
      const encryptedSession = sessionStore.getSessionByPublicId(publicId);
      if (!encryptedSession) {
        setError("Session not found");
        return;
      }

      const decryptedSession = await decryptSession(encryptedSession);
      if (!decryptedSession) {
        setError("Failed to decrypt session");
        return;
      }

      setSession(decryptedSession);
    } catch {
      setError("Failed to decrypt session");
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    if (hasHydrated) {
      handleLoadSession();
    }
  }, [handleLoadSession, hasHydrated]);

  if (!hasHydrated || isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  return <Content session={session} />;
};

export default SessionDecrypt;
