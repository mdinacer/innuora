"use client";

import React, { useMemo } from "react";

import LoadingComponent from "@/components/loading-component";
import SessionsEmptyState from "@/components/sessions/sessions-page//sessions-empty-state";
import SessionsPageActions from "@/components/sessions/sessions-page//sessions-page-actions";
import SessionsPageHeader from "@/components/sessions/sessions-page//sessions-page-header";
import NewSessionsLoader from "@/components/sessions/sessions-page/new-sessions-loader";
import SessionCard from "@/components/sessions/sessions-page/session-card";
import { SessionMetadataSchema, SessionOverview } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useEncryptedChatSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";
import useFetchSessions from "@/lib/sessions/use-fetch-sessions";
import { cn } from "@/lib/utils";

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
      persistOnCloud: session.persistOnCloud ?? false,
      metadata: session.metadata
        ? SessionMetadataSchema.parse(session.metadata)
        : { messageCount: 0, tokenCount: 0, costUSD: 0 },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }, [sessions]);

  if (!hasHydrated) {
    return <LoadingComponent />;
  }

  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-12", className)}>
      <SessionsPageHeader />

      <NewSessionsLoader className="my-6" />

      {sessionsOverview.length > 0 ? (
        <>
          <SessionsPageActions />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2" id="sessionsGrid">
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
