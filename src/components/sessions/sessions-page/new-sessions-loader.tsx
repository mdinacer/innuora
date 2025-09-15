"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Session } from "@prisma/client";
import { Loader2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getSessionById } from "@/app/actions/session-actions";
import {
  getUniqueObfuscatedId,
  useEncryptedChatSessionStore,
} from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const NewSessionsLoader: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation(["pages", "common"]);
  const [loadingStatus, setLoadingStatus] = useState<{
    loading: boolean;
    loaded: boolean;
    error: string | null;
  }>({
    loading: false,
    loaded: false,
    error: null,
  });
  const changesMap = useEncryptedChatSessionStore((state) => state.sessionsChangesMap);

  const newItems = useMemo(
    () =>
      Object.entries(changesMap)
        .filter(([, values]) => values.state === "new")
        .map(([id, values]) => ({ id, ...values }) as const),
    [changesMap]
  );

  const content = useMemo(
    () => ({
      title: t("title", { keyPrefix: "sessions.newSessionsPrompt" }),
      subtitle: t("subtitle", { keyPrefix: "sessions.newSessionsPrompt" }),
      action: t("action", { keyPrefix: "sessions.newSessionsPrompt" }),
      loading: t("loading", { keyPrefix: "sessions.newSessionsPrompt" }),
    }),
    [t]
  );

  const handleLoadNewSessions = useCallback(async () => {
    if (newItems.length === 0) return;
    setLoadingStatus({ loading: true, loaded: false, error: null });

    try {
      const sessions = (await Promise.all(newItems.map(({ id }) => getSessionById(id)))).filter(Boolean) as Session[];

      if (sessions.length > 0) {
        const state = useEncryptedChatSessionStore.getState();
        for (const session of sessions) {
          const obfuscatedId = getUniqueObfuscatedId(state.sessionIdMap);
          state.setSession(obfuscatedId, session);
          state.setChangesMap((prevMap) => {
            const newMap = { ...prevMap };
            delete newMap[session.id];
            return newMap;
          });
        }
      }
      setLoadingStatus({ loading: false, loaded: true, error: null });
    } catch (error) {
      setLoadingStatus({
        loading: false,
        loaded: false,
        error: error instanceof Error ? error.message : "Error loading sessions",
      });
    } finally {
      setLoadingStatus((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }, [newItems]);

  if (newItems.length === 0) return null;
  return (
    <div
      className={cn(
        "w-full flex items-center justify-between bg-mir-bg-soft rounded-2xl p-6 border border-mir-bg-accent/20",
        className
      )}
    >
      <h2 className="text-2xl font-bold">{content.title}</h2>

      <button
        onClick={handleLoadNewSessions}
        className="flex items-center gap-2 rounded-2xl border border-mir-border-light bg-mir-bg-card px-4 py-2 text-sm font-medium transition hover:shadow-subtle hover:border-mir-bg-accent/30 hover:bg-mir-bg-accent hover:text-white duration-300 ease-in-out hover:-translate-y-0.5"
      >
        {loadingStatus.loading && <Loader2Icon className="animate-spin size-5" />}
        {loadingStatus.loading
          ? content.loading
          : t("action", {
              item: t("sessionWithCount", { count: newItems.length, ns: "common", keyPrefix: "" }),
              keyPrefix: "sessions.newSessionsPrompt",
            })}
      </button>
    </div>
  );
};

export default NewSessionsLoader;
