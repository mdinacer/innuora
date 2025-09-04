import { useCallback, useEffect } from "react";

import { SessionFlowState, useSessionStore } from "@/stores/session.store";

export function useSessionState({ sessionId, autoCreate = false }: { sessionId: string; autoCreate?: boolean }) {
  const session = useSessionStore((state) => state.sessions[sessionId]);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);

  const updateSession = useCallback(
    (updates: Partial<SessionFlowState> | ((prev: SessionFlowState) => SessionFlowState)) =>
      useSessionStore.getState().updateSession(sessionId, updates),
    [sessionId]
  );
  const setCurrentStepId = useCallback(
    (stepId: string | null) => useSessionStore.getState().setCurrentStepId(sessionId, stepId),
    [sessionId]
  );
  const setInputValues = useCallback(
    (inputValues: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) =>
      useSessionStore.getState().setInputValues(sessionId, inputValues),
    [sessionId]
  );
  const setChatSummary = useCallback(
    (summary: string | null) => useSessionStore.getState().setChatSummary(sessionId, summary),
    [sessionId]
  );
  const createSession = useCallback(() => useSessionStore.getState().createSession(sessionId), [sessionId]);
  const markStarted = useCallback(() => useSessionStore.getState().markStarted(sessionId), [sessionId]);
  const markEnded = useCallback(() => useSessionStore.getState().markEnded(sessionId), [sessionId]);
  const resetSession = useCallback(() => useSessionStore.getState().resetSession(sessionId), [sessionId]);
  const deleteSession = useCallback(() => useSessionStore.getState().deleteSession(sessionId), [sessionId]);

  useEffect(() => {
    if (autoCreate && hasHydrated && !session) {
      useSessionStore.getState().createSession(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, hasHydrated]);

  return {
    session,
    hasHydrated,
    createSession,
    setCurrentStepId,
    updateSession,
    setInputValues,
    setChatSummary,
    markStarted,
    markEnded,
    resetSession,
    deleteSession,
  };
}
