"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudAlert, CloudOff, Loader2 } from "lucide-react";

import { sessionSynchronizer } from "@/domains/session-sync";
import { SyncStatusDetailed } from "@/domains/session-sync/session-sync.types";
import { cn } from "@/lib/utils";

interface SyncStatusIndicatorProps {
  sessionId: string;
  className?: string;
}

export function SyncStatusIndicator({ sessionId, className }: SyncStatusIndicatorProps) {
  const [status, setStatus] = useState<SyncStatusDetailed>(sessionSynchronizer.getSyncStatus(sessionId));

  useEffect(() => {
    const listener = (sid: string, newStatus: SyncStatusDetailed) => {
      if (sid === sessionId) {
        setStatus(newStatus);
      }
    };

    sessionSynchronizer.addStatusChangeListener(listener);
    setStatus(sessionSynchronizer.getSyncStatus(sessionId));

    return () => {
      sessionSynchronizer.removeStatusChangeListener(listener);
    };
  }, [sessionId]);

  const cloudStatus = status.cloud;
  const localStatus = status.local;

  // Determine display state
  const isSyncing = localStatus === "syncing" || cloudStatus === "syncing";
  const hasError = localStatus === "error" || cloudStatus === "error";
  const isDisabled = cloudStatus === "disabled";
  const isSynced = localStatus === "synced" && (cloudStatus === "synced" || cloudStatus === "disabled");

  // Icon and color
  let Icon = Cloud;
  let colorClass = "text-muted-foreground";
  let label = "Synced";

  if (isSyncing) {
    Icon = Loader2;
    colorClass = "text-blue-500";
    label = "Syncing...";
  } else if (hasError) {
    Icon = CloudAlert;
    colorClass = "text-destructive";
    label = "Sync error";
  } else if (isDisabled) {
    Icon = CloudOff;
    colorClass = "text-muted-foreground/50";
    label = "Cloud sync disabled";
  } else if (isSynced) {
    Icon = Cloud;
    colorClass = "text-green-500";
    label = "Synced";
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)} title={label}>
      <Icon className={cn("h-4 w-4", colorClass, isSyncing && "animate-spin")} />
      <span className={cn("hidden sm:inline", colorClass)}>{label}</span>
    </div>
  );
}
