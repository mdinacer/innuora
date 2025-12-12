import React from "react";
import Link from "next/link";
import { CogIcon, PlayIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSessionStore } from "@/domains/session-persistence";
import { ConversationSession } from "@/domains/session-state/session-state.types";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  session: ConversationSession;
}

const SessionDetailsQuickActions: React.FC<Props> = ({ className, session }) => {
  const publicId = useSessionStore((state) => state.getSessionByPublicId(session.id));

  return (
    <Card className={cn("px-6", className)}>
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <CogIcon className="size-5 text-primary" />
        Actions
      </h3>

      <div className="space-y-3">
        {publicId && (
          <Link
            href={`/sessions/${publicId}`}
            className={cn("justify-start", buttonVariants({ variant: "primary", size: "full" }))}
          >
            <PlayIcon className="size-4" />
            Resume Session
          </Link>
        )}

        {/* <SessionForm
          session={session}
          trigger={
            <Button variant="secondary" size="full" className="justify-start">
              <PencilIcon className="size-4 shrink-0" />
              Edit Details
            </Button>
          }
        /> */}
      </div>
    </Card>
  );
};

export default SessionDetailsQuickActions;
