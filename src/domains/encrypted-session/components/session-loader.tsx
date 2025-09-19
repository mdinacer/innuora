"use client";

import React from "react";

import LoadingComponent from "@/components/loading-component";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";

interface Props {
  publicId: string;
  content: React.ComponentType<{ sessionId: string }>;
}

const SessionLoader: React.FC<Props> = ({ publicId, content: Content }) => {
  const hasHydrated = useSessionStore((state) => state.hasHydrated);

  const sessionId = useSessionStore((state) => state.publicIdMap[publicId]);

  if (!hasHydrated) {
    return <LoadingComponent />;
  }

  if (!sessionId) {
    return <div>Session not found</div>;
  }

  return <Content sessionId={sessionId} />;
};

export default SessionLoader;
