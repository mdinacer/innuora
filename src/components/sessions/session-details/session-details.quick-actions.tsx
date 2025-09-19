import React from "react";
import Link from "next/link";
import { CogIcon, PencilIcon, PlayIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/mir-ui/button";
import Card from "@/components/mir-ui/card";
import SessionForm from "@/components/sessions/session-form";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  session: Session;
}

const SessionDetailsQuickActions: React.FC<Props> = ({ className, session }) => {
  const publicId = useSessionStore((state) => state.getSessionPublicId(session.id));

  return (
    <Card className={className}>
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <CogIcon className="size-5 text-mir-bg-accent" />
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

        <SessionForm
          session={session}
          trigger={
            <Button variant="secondary" size="full" className="justify-start">
              <PencilIcon className="size-4 shrink-0" />
              Edit Details
            </Button>
          }
        />
      </div>
    </Card>
  );
};

export default SessionDetailsQuickActions;
