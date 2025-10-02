"use client";

import React, { useMemo } from "react";

import LoadingComponent from "@/components/loading-component";
import SessionsEmptyState from "@/components/sessions/sessions-page//sessions-empty-state";
import SessionsPageActions from "@/components/sessions/sessions-page//sessions-page-actions";
import SessionsPageHeader from "@/components/sessions/sessions-page//sessions-page-header";
import SessionsCloudState from "@/components/sessions/sessions-page/cloud-sessoins-state";
import SessionCard from "@/components/sessions/sessions-page/session-card";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { SessionMetadataSchema, SessionOverview } from "@/domains/open-chat/open-chat.types";
import { cn } from "@/lib/utils";

interface SessionsPageProps {
  className?: string;
}

const SessionsPage: React.FC<SessionsPageProps> = ({ className }) => {
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const sessions = useSessionStore((state) => state.sessions);

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
        : { messageCount: 0, tokenCount: 0, inputTokens: 0, outputTokens: 0, costUSD: 0, creditsUsed: 0 },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }, [sessions]);

  if (!hasHydrated) {
    return <LoadingComponent />;
  }

  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-12 flex flex-col", className)}>
      <SessionsPageHeader />

      <SessionsCloudState className="my-6" />

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
