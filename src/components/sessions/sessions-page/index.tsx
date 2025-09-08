"use client";

import React from "react";

import SessionsEmptyState from "@/components/sessions/sessions-page//sessions-empty-state";
import SessionsGrid from "@/components/sessions/sessions-page//sessions-grid";
import SessionsPageActions from "@/components/sessions/sessions-page//sessions-page-actions";
import SessionsPageHeader from "@/components/sessions/sessions-page//sessions-page-header";
import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import { cn } from "@/lib/utils";

interface SessionsPageProps {
  className?: string;
}

const SessionsPage: React.FC<SessionsPageProps> = ({ className }) => {
  const sessions = useOpenChatSessionStore((state) => state.sessions);
  return (
    <div className={cn("max-w-6xl mx-auto px-6 py-12", className)}>
      <SessionsPageHeader />

      {Object.keys(sessions).length > 0 ? (
        <>
          <SessionsPageActions />
          <SessionsGrid sessions={sessions} />
        </>
      ) : (
        <SessionsEmptyState />
      )}
    </div>
  );
};

export default SessionsPage;
