"use client";

import React, { useMemo } from "react";

import SessionsEmptyState from "@/components/sessions/sessions-page//sessions-empty-state";
import SessionsPageActions from "@/components/sessions/sessions-page//sessions-page-actions";
import SessionsPageHeader from "@/components/sessions/sessions-page//sessions-page-header";
import { SessionMetadataSchema, SessionOverview } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useEncryptedChatSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";
import useFetchSessions from "@/lib/sessions/use-fetch-sessions";
import { cn } from "@/lib/utils";
import SessionCard from "./session-card";

interface SessionsPageProps {
  className?: string;
}

const SessionsPage: React.FC<SessionsPageProps> = ({ className }) => {
  useFetchSessions();
  const hasHydrated = useEncryptedChatSessionStore((state) => state.hasHydrated);
  const sessions = useEncryptedChatSessionStore((state) => state.sessions);

  const sessionsOverview = useMemo(() => {
    if (Object.keys(sessions).length === 0) return [] as SessionOverview[];
    return Object.entries(sessions).map(([id, session]) => ({
      id: session.id,
      obfuscatedId: id,
      title: session.title,
      subtitle: session.subtitle,
      autoUpdateTitle: session.autoUpdateTitle,
      metadata: session.metadata
        ? SessionMetadataSchema.parse(session.metadata)
        : { messageCount: 0, tokenCount: 0, costUSD: 0 },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }, [sessions]);

  if (!hasHydrated) {
    return <div>Loading</div>;
  }

  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-12", className)}>
      <SessionsPageHeader />

      {sessionsOverview.length > 0 ? (
        <>
          <SessionsPageActions />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="sessionsGrid">
            {sessionsOverview.map((session, index) => (
              <SessionCard key={index} session={session} />
            ))}
          </div>
        </>
      ) : (
        <SessionsEmptyState />
      )}
    </div>
  );
};

export default SessionsPage;
