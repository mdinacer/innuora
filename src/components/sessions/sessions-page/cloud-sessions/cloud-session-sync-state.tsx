"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { Session } from "@prisma/client";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getSessionsInfo } from "@/app/actions/session-actions";
import { SessionMeta } from "@/domains/open-chat/open-chat.types";
import { cn } from "@/lib/utils";
import CloudSessionStateCard from "./cloud-session-state-card";

export type SessionState = {
  id: string;
  title: string;
  metadata: SessionMeta;
  timestamp: Date;
  state: "new" | "updated";
};

export type SessionLoadingState = {
  loading: boolean;
  error: string | null;
  completed: boolean;
};

interface Props {
  className?: string;
  sessions: Session[];
}
const CloudSessionSyncState: React.FC<Props> = ({ className, sessions = [] }) => {
  const { t } = useTranslation("pages", { keyPrefix: "cloud_updates" });

  const { title, buttons } = useMemo(
    () => ({
      title: {
        loading: {
          title: t("title.loading.title"),
          subtitle: t("title.loading.subtitle"),
        },
        synced: {
          title: t("title.synced.title"),
          subtitle: t("title.synced.subtitle"),
        },
        unsynced: {
          title: t("title.unsynced.title"),
          subtitle: t("title.unsynced.subtitle"),
        },
      },

      buttons: {
        load: (count: number) => t("buttons.load", { count }),
        loading: t("buttons.loading"),
        check: t("buttons.check"),
        checking: t("buttons.checking"),
        skip: t("buttons.skip"),
      },
    }),
    [t]
  );

  const [isFetching, setFetching] = React.useState(false);
  const [isSyncing, setSyncing] = React.useState(false);

  const [cloudSessionsState, setCloudSessionsState] = React.useState<SessionState[]>([]);
  const [sessionsLoadingState, setSessionsLoadingState] = React.useState<Record<string, SessionLoadingState>>({});

  const setSessionLoadingState = (sessionId: string, state: SessionLoadingState) => {
    setSessionsLoadingState((prev) => ({
      ...prev,
      [sessionId]: state,
    }));
  };

  const sessionsMap = useMemo(() => {
    return sessions.reduce(
      (acc, session) => {
        acc[session.id] = session;
        return acc;
      },
      {} as Record<string, Session>
    );
  }, [sessions]);

  const initialFetchRef = React.useRef(true);

  const handleCheckUpdates = useCallback(async () => {
    setFetching(true);
    try {
      const data: SessionState[] = [];
      const remoteSessions = await getSessionsInfo();

      if (remoteSessions.length === 0) return;
      const nextLoadingStates: Record<string, SessionLoadingState> = {};

      for (const remoteSession of remoteSessions) {
        const localSession = sessionsMap[remoteSession.id];
        if (localSession === undefined) {
          data.push({
            id: remoteSession.id,
            title: remoteSession.title,
            timestamp: remoteSession.updatedAt,
            metadata: remoteSession.metadata as SessionMeta,
            state: "new",
          });
        } else {
          const localTime = new Date(localSession.updatedAt).getTime();
          const remoteTime = new Date(remoteSession.updatedAt).getTime();
          if (localTime < remoteTime) {
            data.push({
              id: remoteSession.id,
              title: remoteSession.title,
              timestamp: remoteSession.updatedAt,
              metadata: remoteSession.metadata as SessionMeta,
              state: "updated",
            });
          }
        }
        nextLoadingStates[remoteSession.id] = { loading: false, error: null, completed: false };
      }
      setSessionsLoadingState(nextLoadingStates);

      setCloudSessionsState(data);
      setFetching(false);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  }, [sessionsMap]);

  useEffect(() => {
    let mounted = true;
    if (!initialFetchRef.current) return;

    (async () => {
      await handleCheckUpdates();
      if (mounted) initialFetchRef.current = false;
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasUpdates =
    cloudSessionsState.length > 0 && Object.values(sessionsLoadingState).some((state) => !state.completed);

  async function handleSyncSession(sessionId: string): Promise<void> {
    setSessionLoadingState(sessionId, { loading: true, error: null, completed: false });
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Operation complete after 3 seconds");
        setSessionLoadingState(sessionId, { loading: false, error: null, completed: true });
        resolve();
      }, 3000);
    });
  }

  async function handleSyncAll() {
    setSyncing(true);
    for (const session of cloudSessionsState) {
      await handleSyncSession(session.id);
    }
    setSyncing(false);
  }

  const clearStates = () => {
    setCloudSessionsState([]);
    setSessionsLoadingState({});
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative overflow-hidden w-full bg-inn-bg-soft rounded-2xl border p-6 border-inn-border-light">
        {isFetching ? (
          <div>
            <h2 className="text-xl font-bold">{title.loading.title}</h2>
            <p className="text-inn-text-secondary text-sm">{title.loading.subtitle}</p>
          </div>
        ) : (
          <>
            {/* <p>{isSyncing ? "Syncing" : "not syncing"}</p> */}
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                hasUpdates ? "mb-6" : "mb-0"
              )}
            >
              <div>
                <h2 className={"text-xl font-bold mb-1"}>{hasUpdates ? title.unsynced.title : title.synced.title}</h2>
                <p className="text-inn-text-secondary text-sm">
                  {hasUpdates ? title.unsynced.subtitle : title.synced.subtitle}
                </p>
              </div>

              {hasUpdates ? (
                <div className="flex items-center gap-x-4 ">
                  <button
                    disabled={isSyncing || Object.values(sessionsLoadingState).some((state) => state.loading)}
                    onClick={handleSyncAll}
                    className={cn(
                      "px-6 py-2 bg-inn-bg-accent text-white rounded-xl font-semibold transition hover:opacity-90 flex items-center justify-center gap-2",
                      "disabled:pointer-events-none disabled:opacity-50"
                    )}
                  >
                    {isSyncing ? (
                      <Loader2Icon className="animate-spin size-4 shrink-0" />
                    ) : (
                      <DownloadIcon className="size-4 shrink-0" />
                    )}
                    {isSyncing ? buttons.loading : buttons.load(cloudSessionsState.length)}
                  </button>
                  <button
                    onClick={clearStates}
                    disabled={isSyncing}
                    className={cn(
                      "flex-1 sm:flex-none px-4 py-2 bg-inn-bg-card border border-inn-border-light text-inn-text-secondary rounded-xl font-medium transition hover:bg-inn-bg-input hover:text-inn-text-primary",
                      "disabled:pointer-events-none disabled:opacity-50"
                    )}
                  >
                    {buttons.skip}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCheckUpdates}
                  className="flex-1 sm:flex-none px-4 py-2 bg-inn-bg-card border border-inn-border-light text-inn-text-secondary rounded-xl font-medium transition hover:bg-inn-bg-input hover:text-inn-text-primary"
                >
                  {isSyncing ? buttons.checking : buttons.check}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {cloudSessionsState.map((session) => (
                <CloudSessionStateCard
                  disabled={isSyncing || Object.values(sessionsLoadingState).some((state) => state.loading)}
                  loadingState={sessionsLoadingState[session.id]}
                  key={session.id}
                  sessionData={session}
                  onClick={async () => handleSyncSession(session.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CloudSessionSyncState;
