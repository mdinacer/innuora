"use client";

import React, { useCallback, useEffect, useState } from "react";

import LoadingComponent from "@/components/loading-component";
import { useActiveSessionStore } from "@/domains/active-session/active-session.store";
import { decryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";

interface Props {
  publicId: string;
  content: React.ComponentType<{ session: Session }>;
}

const ActiveSessionLoader: React.FC<Props> = ({ publicId, content: Content }) => {
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const session = useActiveSessionStore((state) => state.session);
  const isLoading = useActiveSessionStore((state) => state.isLoading);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSession = useCallback(async () => {
    const activeStore = useActiveSessionStore.getState();
    const sessionStore = useSessionStore.getState();

    activeStore.setLoading(true);
    setError(null);

    try {
      const sessionId = sessionStore.publicIdMap[publicId];
      if (!sessionId) {
        setError("Session not found");
        return;
      }

      const encryptedSession = sessionStore.getSession(sessionId);
      if (!encryptedSession) {
        setError("Session not found");
        return;
      }

      const decryptedSession = await decryptSession(encryptedSession);
      if (!decryptedSession) {
        setError("Failed to decrypt session");
        return;
      }

      activeStore.setSession(decryptedSession);
    } catch (error) {
      console.error("Failed to load session:", error);
      setError("Failed to load session");
    } finally {
      activeStore.setLoading(false);
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

export default ActiveSessionLoader;
