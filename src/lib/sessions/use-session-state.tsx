/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from "react";

import { SessionFlowState, useSessionStore } from "@/stores/session-store";

export function useSessionState({ sessionId, autoCreate = false }: { sessionId: string; autoCreate?: boolean }) {
  const session = useSessionStore((state) => state.sessions[sessionId]);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const store = useSessionStore;
  const updateSession = useCallback(
    (updates: Partial<SessionFlowState> | ((prev: SessionFlowState) => SessionFlowState)) =>
      store.getState().updateSession(sessionId, updates),
    [sessionId]
  );
  const setCurrentStepId = useCallback(
    (stepId: string | null) => store.getState().setCurrentStepId(sessionId, stepId),
    [sessionId]
  );
  const setInputValues = useCallback(
    (inputValues: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) =>
      store.getState().setInputValues(sessionId, inputValues),
    [sessionId]
  );
  const setChatSummary = useCallback(
    (summary: string | null) => store.getState().setChatSummary(sessionId, summary),
    [sessionId]
  );
  const createSession = useCallback(() => store.getState().createSession(sessionId), [sessionId]);
  const markStarted = useCallback(() => store.getState().markStarted(sessionId), [sessionId]);
  const markEnded = useCallback(() => store.getState().markEnded(sessionId), [sessionId]);
  const resetSession = useCallback(() => store.getState().resetSession(sessionId), [sessionId]);
  const deleteSession = useCallback(() => store.getState().deleteSession(sessionId), [sessionId]);

  useEffect(() => {
    if (autoCreate && hasHydrated && !session) {
      store.getState().createSession(sessionId);
    }
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
