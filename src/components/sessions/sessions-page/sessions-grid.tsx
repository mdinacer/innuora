import React from "react";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import SessionCard from "./session-card";

interface Props {
  sessions: Record<string, Session>;
}

const SessionsGrid: React.FC<Props> = ({ sessions = {} }) => {
  const sessionsArray = Object.values(sessions);
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="sessionsGrid">
      {sessionsArray.map((session, index) => (
        <SessionCard key={index} session={session} />
      ))}
    </div>
  );
};

export default SessionsGrid;
