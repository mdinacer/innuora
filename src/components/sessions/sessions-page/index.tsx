"use client";

import React, { useMemo } from "react";

import SessionsEmptyState from "@/components/sessions/sessions-page//sessions-empty-state";
import SessionsPageActions from "@/components/sessions/sessions-page//sessions-page-actions";
import SessionsPageHeader from "@/components/sessions/sessions-page//sessions-page-header";
import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import useFetchSessions from "@/lib/sessions/use-fetch-sessions";
import { cn } from "@/lib/utils";
import SessionCard from "./session-card";

interface SessionsPageProps {
  className?: string;
}

const SessionsPage: React.FC<SessionsPageProps> = ({ className }) => {
  useFetchSessions();
  const sessions = useOpenChatSessionStore((state) => state.sessions);

  const sessionsArray = useMemo(() => Object.values(sessions), [sessions]);
  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-12", className)}>
      <SessionsPageHeader />

      {sessionsArray.length > 0 ? (
        <>
          <SessionsPageActions />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="sessionsGrid">
            {sessionsArray.map((session, index) => (
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
