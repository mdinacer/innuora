import React from "react";
import { AlertTriangleIcon, RotateCcwIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Session } from "@/domains/open-chat/open-chat.types";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  session: Session;
}

const SessionDetailsDangerZone: React.FC<Props> = ({ className }) => {
  return (
    <Card className={cn("border-red-200 dark:border-red-800 px-6", className)}>
      <h3 className="font-bold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
        <AlertTriangleIcon className="size-5" />
        Danger Zone
      </h3>

      <div className="space-y-3">
        <Button
          variant="secondary"
          size="full"
          className="hover:bg-yellow-50 dark:hover:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 transition"
        >
          <RotateCcwIcon className="size-4 shrink-0" />
          Reset Progress
        </Button>

        <Button variant="destructive" size="full">
          <TrashIcon className="size-4 shrink-0" />
          Delete Session
        </Button>
      </div>
    </Card>
  );
};

export default SessionDetailsDangerZone;
