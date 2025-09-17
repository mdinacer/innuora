"use client";

import React, { useMemo } from "react";

import LoadingComponent from "@/components/loading-component";
import { useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";

interface Props {
  publicId: string;
  content: React.ComponentType<{ sessionId: string }>;
}

const SessionLoader: React.FC<Props> = ({ publicId, content: Content }) => {
  const hasHydrated = useEncryptedSessionStore((state) => state.hasHydrated);

  const sessionId = useMemo(() => useEncryptedSessionStore.getState().publicIdMap[publicId], [publicId]);

  if (!hasHydrated) {
    return <LoadingComponent />;
  }

  if (!sessionId) {
    return <div>Session not found</div>;
  }

  return <Content sessionId={sessionId} />;
};

export default SessionLoader;
