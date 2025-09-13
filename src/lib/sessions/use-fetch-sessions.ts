import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAfter, parseISO } from "date-fns";

import { getSessionById, getSessionsUpdateInfo } from "@/app/actions/session-actions";
import {
  getUniqueObfuscatedId,
  useEncryptedChatSessionStore,
} from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";

function hasUpdates<T extends { updatedAt: Date | string }>(cloudSession: T, localSession: T) {
  const cloudDate =
    typeof cloudSession.updatedAt === "string" ? parseISO(cloudSession.updatedAt) : cloudSession.updatedAt;
  const localDate =
    typeof localSession.updatedAt === "string" ? parseISO(localSession.updatedAt) : localSession.updatedAt;
  return isAfter(cloudDate, localDate);
}

function reverseMap<K extends string | number | symbol, V extends string | number | symbol>(
  map: Record<K, V>
): Record<V, K> {
  const reversed = {} as Record<V, K>;

  for (const key in map) {
    const value = map[key];
    reversed[value] = key;
  }

  return reversed;
}

export default function useFetchSessions() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [updateInfo, setUpdateInfo] = useState<{ id: string; updatedAt: Date }[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const hasHydrated = useEncryptedChatSessionStore((state) => state.hasHydrated);
  const sessions = useEncryptedChatSessionStore((state) => state.sessions);
  const sessionIdMap = useEncryptedChatSessionStore((state) => state.sessionIdMap);

  const reversedMap = useMemo(() => reverseMap(sessionIdMap), [sessionIdMap]);

  const isInitialRunRef = useRef(true);
  const processedUpdateInfo = useRef<string>("");

  const addNewSession = useCallback(
    async (sessionId: string) => {
      // Prevent duplicate processing
      if (processingIds.has(sessionId)) return;

      setProcessingIds((prev) => new Set(prev).add(sessionId));

      try {
        const session = await getSessionById(sessionId);
        if (!session) return;

        // Get fresh store state to avoid stale closure issues
        const currentStore = useEncryptedChatSessionStore.getState();

        // Double-check the session doesn't already exist (race condition protection)
        if (Object.values(currentStore.sessionIdMap).includes(sessionId)) {
          return;
        }

        const obfuscatedId = getUniqueObfuscatedId(currentStore.sessionIdMap);
        currentStore.setSession(obfuscatedId, session);
      } catch (error) {
        console.error("Error adding new session:", error);
        setErrors((prev) => [...prev, `Failed to add session ${sessionId}`]);
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
      }
    },
    [processingIds]
  );

  const checkForUpdates = useCallback(
    (updateInfo: { id: string; updatedAt: Date }) => {
      const obfuscatedId = reversedMap[updateInfo.id];
      if (!obfuscatedId) return false;

      const localSession = sessions[obfuscatedId];
      return localSession && hasUpdates(updateInfo, localSession);
    },
    [reversedMap, sessions]
  );

  const handleFetchAndUpdate = useCallback(
    async (sessionId: string, obfuscatedId: string) => {
      // Prevent duplicate processing
      if (processingIds.has(sessionId)) return;

      setProcessingIds((prev) => new Set(prev).add(sessionId));

      try {
        const data = await getSessionById(sessionId);
        if (data) {
          useEncryptedChatSessionStore.getState().setSession(obfuscatedId, data);
        }
      } catch (error) {
        console.error("Error fetching and updating session:", error);
        setErrors((prev) => [...prev, `Failed to update session ${sessionId}`]);
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
      }
    },
    [processingIds]
  );

  const handleFetchSessionUpdateInfo = useCallback(async () => {
    if (loading) return; // Prevent concurrent fetches

    setLoading(true);
    try {
      const data = await getSessionsUpdateInfo();
      setUpdateInfo(data);
    } catch (error) {
      console.error("Error fetching sessions update info:", error);
      setErrors((prev) => [...prev, "Error fetching sessions update info"]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

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

        const isNew = !Object.values(sessionIdMap).includes(item.id);

        if (isNew) {
          await addNewSession(item.id);
        } else {
          const needsUpdate = checkForUpdates(item);
          if (needsUpdate) {
            const obfuscatedId = reversedMap[item.id];
            if (obfuscatedId) {
              await handleFetchAndUpdate(item.id, obfuscatedId);
            }
          }
        }
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
  }, [
    addNewSession,
    checkForUpdates,
    handleFetchAndUpdate,
    reversedMap,
    sessionIdMap,
    updateInfo,
    loading,
    processingIds,
  ]);

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
