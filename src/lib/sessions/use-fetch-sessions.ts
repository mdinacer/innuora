import { useCallback, useEffect, useRef, useState } from "react";
import { isAfter, parseISO } from "date-fns";

import { getSessionsUpdateInfo } from "@/app/actions/session-actions";
import { SessionChangeState, useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";

function hasUpdates<T extends { updatedAt: Date | string }>(cloudSession: T, localSession: T) {
  const cloudDate =
    typeof cloudSession.updatedAt === "string" ? parseISO(cloudSession.updatedAt) : cloudSession.updatedAt;
  const localDate =
    typeof localSession.updatedAt === "string" ? parseISO(localSession.updatedAt) : localSession.updatedAt;
  return isAfter(cloudDate, localDate);
}

export default function useFetchSessions() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [updateInfo, setUpdateInfo] = useState<{ id: string; updatedAt: Date }[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const hasHydrated = useEncryptedSessionStore((state) => state.hasHydrated);
  const sessions = useEncryptedSessionStore((state) => state.sessions);

  const isInitialRunRef = useRef(true);
  const processedUpdateInfo = useRef<string>("");

  const checkForUpdates = useCallback(
    (updateInfo: { id: string; updatedAt: Date }) => {
      const localSession = sessions[updateInfo.id];
      if (!localSession) return false;

      return localSession && hasUpdates(updateInfo, localSession);
    },
    [sessions]
  );

  const handleFetchSessionUpdateInfo = useCallback(async () => {
    if (loading) return; // Prevent concurrent fetches

    setLoading(true);
    try {
      const data: { id: string; updatedAt: Date }[] = await getSessionsUpdateInfo();
      if (!data.length) return;
      for (const item of data) {
        useEncryptedSessionStore.getState().addOnlineSessionId(item.id);
      }
      setUpdateInfo(data);
    } catch (error) {
      console.error("Error fetching sessions update info:", error);
      setErrors((prev) => [...prev, "Error fetching sessions update info"]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const addChangesEntry = useCallback(async (sessionId: string, entry: SessionChangeState) => {
    useEncryptedSessionStore.getState().setChangesMap((prev) => {
      const newMap = { ...prev };
      newMap[sessionId] = entry;
      return newMap;
    });
  }, []);

  const handleUpdates = useCallback(async () => {
    if (updateInfo.length === 0 || loading) return;

    // Create unique key for this update batch to prevent reprocessing
    const updateInfoKey = updateInfo.map((item) => `${item.id}-${item.updatedAt.getTime()}`).join(",");
    if (processedUpdateInfo.current === updateInfoKey) return;

    setLoading(true);

    try {
      // Process updates sequentially to avoid race conditions
      for (const item of updateInfo) {
        // Skip if already processing this session
        if (processingIds.has(item.id)) continue;

        const session = sessions[item.id];

        const isNew = !session;
        const hasUpdates = checkForUpdates(item);

        if (!isNew && !hasUpdates) continue;

        const sessionChange: SessionChangeState = {
          sessionId: session?.id,
          state: isNew ? "new" : "modified",
          updatedAt: item.updatedAt,
        };

        await addChangesEntry(item.id, sessionChange);
        setProcessingIds((prev) => new Set(prev).add(item.id));
      }

      // Mark this batch as processed
      processedUpdateInfo.current = updateInfoKey;
    } catch (error) {
      console.error("Error updating sessions:", error);
      setErrors((prev) => [...prev, "Error updating sessions"]);
    } finally {
      isInitialRunRef.current = false;
      setLoading(false);
    }
  }, [updateInfo, loading, processingIds, sessions, checkForUpdates, addChangesEntry]);

  // Fetch update info on initial hydration
  useEffect(() => {
    if (!hasHydrated || !isInitialRunRef.current) return;
    handleFetchSessionUpdateInfo();
  }, [hasHydrated, handleFetchSessionUpdateInfo]);

  // Process updates when data is available
  useEffect(() => {
    if (!hasHydrated || updateInfo.length === 0) return;
    handleUpdates();
  }, [hasHydrated, updateInfo, handleUpdates]);

  return {
    loading,
    errors,
    // Expose method to manually refresh if needed
    refreshSessions: handleFetchSessionUpdateInfo,
    // Expose processing state for UI feedback
    isProcessing: processingIds.size > 0,
  };
}
