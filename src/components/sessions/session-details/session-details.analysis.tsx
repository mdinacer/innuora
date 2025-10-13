/**
 * Session Details Analysis Component (TEMPORARILY DISABLED)
 *
 * This component has been temporarily disabled as part of the server-side refactoring.
 * It previously relied on client-side access to session.aggregatedAnalysis and session.analysisSnapshots,
 * which are now stored server-side only for security.
 *
 * TODO: Refactor this component to:
 * 1. Create a server action that fetches analysis from getSessionContext()
 * 2. Display the analysis data fetched from server
 * 3. Remove client-side analysis generation button
 */

import React from "react";
import { ChartBarIcon } from "lucide-react";

import Card from "@/components/mir-ui/card";
import { Session } from "@/domains/open-chat/open-chat.types";

interface Props {
  className?: string;
  session: Session;
}

const SessionDetailsAnalysis: React.FC<Props> = ({ className }) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="size-5 text-inn-bg-accent" />
          <h2 className="text-xl font-bold">Session Analysis</h2>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>Session analysis is temporarily unavailable during system refactoring.</p>
        <p className="mt-2">
          We're moving analysis data to secure server-side storage for enhanced security. This feature will be
          re-enabled soon.
        </p>
      </div>
    </Card>
  );
};

export default SessionDetailsAnalysis;
