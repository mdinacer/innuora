/**
 * Session Details Snapshot Component (TEMPORARILY DISABLED)
 *
 * This component has been temporarily disabled as part of the server-side refactoring.
 * It previously relied on client-side access to session.analysisSnapshots,
 * which are now stored server-side only for security.
 *
 * TODO: Refactor this component to:
 * 1. Create a server action that fetches analysis snapshots from getSessionContext()
 * 2. Display the snapshot data fetched from server
 * 3. Consider pagination for large snapshot lists
 */

import React from "react";
import { ListChecksIcon } from "lucide-react";

import { Badge } from "@/components/mir-ui/badge";
import Card from "@/components/mir-ui/card";
import { Session } from "@/domains/open-chat/open-chat.types";

interface Props {
  className?: string;
  session: Session;
}

const SessionDetailsSnapshot: React.FC<Props> = ({ className }) => {
  return (
    <Card className={className}>
      <div className="flex items-center gap-2 mb-4">
        <ListChecksIcon className="size-5 text-inn-bg-accent" />
        <h2 className="text-xl font-bold">Analysis Snapshots</h2>
        <Badge variant="default">0 updates</Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Analysis snapshots are temporarily unavailable during system refactoring.</p>
        <p className="mt-2">
          We're moving snapshot data to secure server-side storage for enhanced security. This feature will be
          re-enabled soon.
        </p>
      </div>
    </Card>
  );
};

export default SessionDetailsSnapshot;
