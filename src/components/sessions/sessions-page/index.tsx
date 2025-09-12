"use client";

import React from "react";

import SessionsEmptyState from "@/components/sessions/sessions-page//sessions-empty-state";
import SessionsPageActions from "@/components/sessions/sessions-page//sessions-page-actions";
import SessionsPageHeader from "@/components/sessions/sessions-page//sessions-page-header";
import useFetchSessions from "@/lib/sessions/use-fetch-sessions";
import { cn } from "@/lib/utils";
import SessionCard from "./session-card";

interface SessionsPageProps {
  className?: string;
}

const SessionsPage: React.FC<SessionsPageProps> = ({ className }) => {
  const { sessions, loading } = useFetchSessions();

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-12", className)}>
      <SessionsPageHeader />

      {sessions.length > 0 ? (
        <>
          <SessionsPageActions />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="sessionsGrid">
            {sessions.map((session, index) => (
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
