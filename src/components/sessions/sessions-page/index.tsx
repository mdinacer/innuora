"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { useOpenChatSessionStore } from "@/stores/open-chat-session.store";
import SessionsEmptyState from "./sessions-empty-state";
import SessionsGrid from "./sessions-grid";
import SessionsPageActions from "./sessions-page-actions";
import SessionsPageHeader from "./sessions-page-header";

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
