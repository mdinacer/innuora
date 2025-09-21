"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { format, isAfter } from "date-fns";
import {
  CircleCheckBigIcon,
  ClockIcon,
  DownloadIcon,
  FilePenLineIcon,
  FilePlusIcon,
  Loader2Icon,
  LucideIcon,
  MessageSquareTextIcon,
} from "lucide-react";

import { Badge } from "@/components/mir-ui/badge";
import { Button } from "@/components/mir-ui/button";
import { getUserSession, getUserSessionOverviews } from "@/domains/encrypted-session/encrypted-session.actions";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { SessionOverview } from "@/domains/open-chat/open-chat.types";
import { cn } from "@/lib/utils";

type CloudSessionState = SessionOverview & { state: "new" | "updated" };

interface SessionPreviewCardProps {
  state: "new" | "updated";
  session: SessionOverview;
  onAction: (id: string, state: "new" | "updated") => void;
}

const SessionPreviewCard: React.FC<SessionPreviewCardProps> = ({ session, state, onAction }) => {
  const Icon: LucideIcon = state === "new" ? FilePlusIcon : FilePenLineIcon;
  const formattedDate = format(new Date(state === "new" ? session.createdAt : session.updatedAt), "PP");
  return (
    <div className="flex items-center justify-between p-4 bg-mir-bg-card border border-mir-border-light rounded-xl">
      <div className="flex items-center gap-4">
        {/* <!-- New Session Icon --> */}
        <div
          className={cn(
            "w-10 h-10 rounded-full  flex items-center justify-center",
            state === "new"
              ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
              : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
          )}
        >
          <Icon
            className={cn(
              "size-5",
              state === "new" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
            )}
          />
        </div>

        {/* <!-- Session Info --> */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-mir-text-primary truncate">{session.title}</h3>
            <Badge className="capitalize" variant={state === "new" ? "success" : "info"}>
              {state}
            </Badge>
          </div>
          <p className="text-sm text-mir-text-secondary line-clamp-1">{session.subtitle}</p>

          {/* <!-- Session Meta --> */}
          <div className="flex items-center gap-4 mt-2 text-xs text-mir-text-secondary">
            <div className="flex items-center gap-1">
              <ClockIcon className="size-3 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquareTextIcon className="size-3 shrink-0" />

              <span>{session.metadata.messageCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Action Button --> */}
      <Button onClick={() => onAction(session.id, state)} className="min-w-[100px] justify-center">
        {state === "new" ? "Download" : "Update"}
      </Button>
    </div>
  );
};

interface Props {
  className?: string;
}

const SessionsCloudState: React.FC<Props> = ({ className }) => {
  const [sessions, setSessions] = useState<CloudSessionState[]>([]);
  //const { t } = useTranslation(["pages", "common"]);
  const [isSkipped, setIsSkipped] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<{
    loading: boolean;
    loaded: boolean;
    error: string | null;
    action?: "download" | "update" | "check";
  }>({
    loading: false,
    loaded: false,
    error: null,
    action: undefined,
  });

  const isInitialCheck = useRef(false);

  // const content = useMemo(
  //   () => ({
  //     title: t("title", { keyPrefix: "sessions.newSessionsPrompt" }),
  //     subtitle: t("subtitle", { keyPrefix: "sessions.newSessionsPrompt" }),
  //     action: t("action", { keyPrefix: "sessions.newSessionsPrompt" }),
  //     loading: t("loading", { keyPrefix: "sessions.newSessionsPrompt" }),
  //   }),
  //   [t]
  // );

  const handleFetchCloudSyncInfo = useCallback(async () => {
    setSessions([]);
    setLoadingStatus({ loading: true, loaded: false, error: null });
    try {
      const storeState = useSessionStore.getState();
      const cloudSessions = await getUserSessionOverviews();
      if (cloudSessions.length === 0) {
        return;
      }

      const newSessions: CloudSessionState[] = [];
      for (const cloudSession of cloudSessions) {
        const storeSession = storeState.getSession(cloudSession.id);

        if (!storeSession) {
          newSessions.push({ state: "new", ...cloudSession });
        } else {
          const hasUpdates = isAfter(cloudSession.updatedAt, storeSession.updatedAt);
          if (hasUpdates) {
            newSessions.push({ state: "updated", ...cloudSession });
          }
        }
      }
      setSessions(newSessions);
    } catch (error) {
      console.error(error);
      setLoadingStatus({ loading: false, loaded: false, error: "Failed to fetch cloud sync info" });
    } finally {
      setLoadingStatus((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const handleProcessSession = useCallback(async (sessionId: string, state: "new" | "updated") => {
    try {
      const sessionData = await getUserSession(sessionId);
      if (!sessionData) {
        throw new Error("No session data found");
      }
      const storeState = useSessionStore.getState();

      if (state === "new") {
        storeState.addSession(sessionData);
      } else {
        storeState.updateSession(sessionId, sessionData);
      }

      // Remove from list after success
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error(error);
      setLoadingStatus({ loading: false, loaded: false, error: "Failed to process session" });
    }
  }, []);

  const handleUpdateAllSessions = useCallback(async () => {
    if (sessions.length === 0) return;

    try {
      await Promise.all(sessions.map((session) => handleProcessSession(session.id, session.state)));
      setSessions([]); // Clear all after bulk update
    } catch (error) {
      console.error(error);
      setLoadingStatus({ loading: false, loaded: false, error: "Failed to update sessions" });
    }
  }, [handleProcessSession, sessions]);

  useEffect(() => {
    if (isInitialCheck.current) return;
    handleFetchCloudSyncInfo();
    isInitialCheck.current = true;
  }, [handleFetchCloudSyncInfo]);

  if (isSkipped) return null;

  if (sessions.length === 0) {
    return (
      <div
        id="emptyState"
        className={cn(
          "w-full flex items-center justify-between bg-mir-bg-soft rounded-xl p-4 border border-mir-bg-accent/25 mt-8 ",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center justify-center">
            <CircleCheckBigIcon className="size-4 shrink-0 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-sm">All sessions synced</p>
            <p className="text-xs text-[var(--text-secondary)]">Your cloud backup is up to date</p>
          </div>
        </div>
        <Button onClick={handleFetchCloudSyncInfo} variant={"outline"}>
          {loadingStatus.loading && <Loader2Icon className="mr-2 animate-spin" />}
          {loadingStatus.loading ? "Checking..." : "Check Again"}
        </Button>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "w-full flex flex-col bg-mir-bg-soft rounded-2xl p-6 border border-mir-bg-accent/25 shadow-[0_4px_20px] shadow-black/10",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold mb-1">Cloud Updates Available</h2>
          <p className="text-mir-text-secondary text-sm">New sessions and updates found in your cloud backup</p>
        </div>

        <Button variant={"outline"} size={"lg"} onClick={handleUpdateAllSessions}>
          <DownloadIcon className="size-4" />
          Load {sessions.length} Session{sessions.length !== 1 ? "s" : ""}
        </Button>
      </div>

      <div className="space-y-3">
        {sessions.map(({ state, ...session }) => (
          <SessionPreviewCard onAction={handleProcessSession} key={session.id} session={session} state={state} />
        ))}
      </div>

      {!loadingStatus.loading && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-mir-border-light">
          <Button className="w-1/4 justify-center" variant={"outline"} onClick={() => setIsSkipped(true)}>
            Skip for Now
          </Button>
          <Button variant={"primary"} size={"full"} onClick={handleUpdateAllSessions}>
            <DownloadIcon />
            Load All Sessions
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionsCloudState;
