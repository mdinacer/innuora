"use client";

import React, { useMemo } from "react";
import { addMinutes } from "date-fns";

import CodeView from "@/components/code-view";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  remoteSessions: { id: string; title: string; updatedAt: Date }[];
}

const TestComponent: React.FC<Props> = ({ className, remoteSessions }) => {
  const sessionData = useMemo(() => {
    const data: any = [];
    const sessionState = useSessionStore.getState();
    const sessions = sessionState.sessions;

    for (const remoteSession of remoteSessions) {
      const localSession = sessions[remoteSession.id];
      if (!localSession) {
        data.push({
          id: remoteSession.id,
          title: remoteSession.title,
          timestamp: remoteSession.updatedAt,
          state: "new",
        });
      } else {
        const localeTime = new Date(localSession.updatedAt).getTime();
        const remoteTime = new Date(remoteSession.updatedAt).getTime();
        if (localeTime < remoteTime) {
          data.push({
            id: remoteSession.id,
            title: remoteSession.title,
            timestamp: remoteSession.updatedAt,
            state: "updated",
          });
        }
      }
    }

    return data;
  }, [remoteSessions]);
  return (
    <div className={cn("", className)}>
      <CodeView data={{ sessionData }} />
    </div>
  );
};

export default TestComponent;
