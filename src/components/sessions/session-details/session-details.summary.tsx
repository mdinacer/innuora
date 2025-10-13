/**
 * Session Details Summary Component (TEMPORARILY DISABLED)
 *
 * This component has been temporarily disabled as part of the server-side refactoring.
 * It previously relied on client-side access to session.continuitySummary,
 * which is now stored server-side only for security.
 *
 * TODO: Refactor this component to:
 * 1. Create a server action that fetches continuity summary from getSessionContext()
 * 2. Display the summary data fetched from server
 * 3. Remove client-side summary generation button
 */

import React from "react";
import { ListIcon } from "lucide-react";

import Card from "@/components/mir-ui/card";
import { Session } from "@/domains/open-chat/open-chat.types";

interface Props {
  className?: string;
  session: Session;
}

const SessionDetailsSummary: React.FC<Props> = ({ className }) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListIcon className="size-5 text-inn-bg-accent" />
          <h2 className="text-xl font-bold">Session Summary</h2>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Session summary is temporarily unavailable during system refactoring.</p>
        <p className="mt-2">
          We're moving summary data to secure server-side storage for enhanced security. This feature will be re-enabled
          soon.
        </p>
      </div>
    </Card>
  );
};

export default SessionDetailsSummary;
