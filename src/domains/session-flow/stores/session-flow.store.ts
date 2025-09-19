/* eslint-disable @typescript-eslint/no-unused-vars */
// =======================
// SESSION FLOW STORE - DOMAIN VERSION
// =======================

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { createDefaultSessionFlowState } from "@/domains/session-flow/constants/session-flow.constants";
import { SessionFlowError, SessionFlowState } from "@/domains/session-flow/types/session-flow-state.types";
import {
  addLogEntry,
  sanitizeInputValues,
  updateSessionFlowTimestamp,
} from "@/domains/session-flow/utils/session-flow-helpers";
import { createSessionFlowError } from "@/domains/session-flow/utils/session-flow-validation";

interface SessionFlowStoreState {
  sessions: Record<string, SessionFlowState>;
  errors: Record<string, SessionFlowError>;

  // Getters
  getSession: (sessionId: string) => SessionFlowState | undefined;
  sessionExists: (sessionId: string) => boolean;
  getSessionError: (sessionId: string) => SessionFlowError | undefined;

  // Session Management
  createSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  resetSession: (sessionId: string) => void;

  // Session Updates
  updateSession: (
    sessionId: string,
    updates: Partial<SessionFlowState> | ((prev: SessionFlowState) => SessionFlowState)
  ) => void;

  // Specific Updates
  setCurrentStepId: (sessionId: string, stepId: string | null) => void;
  setInputValues: (
    sessionId: string,
    inputValues: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)
  ) => void;
  setChatSummary: (sessionId: string, summary: string | null) => void;
  markStarted: (sessionId: string) => void;
  markEnded: (sessionId: string) => void;

  // Logs and Reflections
  addLog: (sessionId: string, message: string) => void;
  // Error Management
  setError: (sessionId: string, error: SessionFlowError) => void;
  clearError: (sessionId: string) => void;

  // Bulk Operations
  setSessions: (
    sessions:
      | Record<string, SessionFlowState>
      | ((prev: Record<string, SessionFlowState>) => Record<string, SessionFlowState>)
  ) => void;
}

export const useSessionFlowStore = create<SessionFlowStoreState>()(
  devtools(
    (set, get) => ({
      sessions: {},
      errors: {},

      // Getters
      getSession: (sessionId) => get().sessions[sessionId],
      sessionExists: (sessionId) => Boolean(get().sessions[sessionId]),
      getSessionError: (sessionId) => get().errors[sessionId],

      // Session Management
      createSession: (sessionId) => {
        const state = get();
        if (state.sessions[sessionId]) {
          console.warn(`[SessionFlow] Session ${sessionId} already exists`);
          return;
        }

        set(
          (state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: createDefaultSessionFlowState(),
            },
          }),
          false,
          "createSession"
        );
      },

      deleteSession: (sessionId) => {
        set(
          (state) => {
            const { [sessionId]: _, ...restSessions } = state.sessions;
            const { [sessionId]: __, ...restErrors } = state.errors;
            return {
              sessions: restSessions,
              errors: restErrors,
            };
          },
          false,
          "deleteSession"
        );
      },

      resetSession: (sessionId) => {
        set(
          (state) => {
            if (!state.sessions[sessionId]) {
              console.warn(`[SessionFlow] Cannot reset non-existent session: ${sessionId}`);
              return state;
            }

            const { [sessionId]: __, ...restErrors } = state.errors;
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: createDefaultSessionFlowState(),
              },
              errors: restErrors,
            };
          },
          false,
          "resetSession"
        );
      },

      // Session Updates
      updateSession: (sessionId, updates) => {
        set(
          (state) => {
            const prevSession = state.sessions[sessionId];
            if (!prevSession) {
              console.warn(`[SessionFlow] Cannot update non-existent session: ${sessionId}`);
              return state;
            }

            try {
              const newSession = typeof updates === "function" ? updates(prevSession) : { ...prevSession, ...updates };

              const timestampedSession = updateSessionFlowTimestamp(newSession);

              return {
                sessions: {
                  ...state.sessions,
                  [sessionId]: timestampedSession,
                },
              };
            } catch (error) {
              console.error(`[SessionFlow] Error updating session ${sessionId}:`, error);
              const sessionError = createSessionFlowError(
                "VALIDATION_ERROR",
                error instanceof Error ? error.message : "Unknown error during update",
                undefined,
                { sessionId }
              );

              return {
                ...state,
                errors: {
                  ...state.errors,
                  [sessionId]: sessionError,
                },
              };
            }
          },
          false,
          "updateSession"
        );
      },

      // Specific Updates
      setCurrentStepId: (sessionId, stepId) => {
        get().updateSession(sessionId, (prev) => ({
          ...prev,
          currentStepId: stepId,
        }));
      },

      setInputValues: (sessionId, inputValues) => {
        get().updateSession(sessionId, (prev) => {
          const newInputValues = typeof inputValues === "function" ? inputValues(prev.inputValues) : inputValues;

          return {
            ...prev,
            inputValues: sanitizeInputValues(newInputValues),
          };
        });
      },

      setChatSummary: (sessionId, summary) => {
        get().updateSession(sessionId, (prev) => ({
          ...prev,
          chatSummary: summary,
        }));
      },

      markStarted: (sessionId) => {
        get().updateSession(sessionId, (prev) => ({
          ...prev,
          hasStarted: true,
          hasEnded: false,
        }));
      },

      markEnded: (sessionId) => {
        get().updateSession(sessionId, (prev) => ({
          ...prev,
          hasEnded: true,
        }));
      },

      // Logs and Reflections
      addLog: (sessionId, message) => {
        get().updateSession(sessionId, (prev) => addLogEntry(prev, message));
      },

      // Error Management
      setError: (sessionId, error) => {
        set(
          (state) => ({
            errors: {
              ...state.errors,
              [sessionId]: error,
            },
          }),
          false,
          "setError"
        );
      },

      clearError: (sessionId) => {
        set(
          (state) => {
            const { [sessionId]: _, ...restErrors } = state.errors;
            return { errors: restErrors };
          },
          false,
          "clearError"
        );
      },

      // Bulk Operations
      setSessions: (sessions) => {
        set(
          (state) => ({
            sessions: typeof sessions === "function" ? sessions(state.sessions) : sessions,
          }),
          false,
          "setSessions"
        );
      },
    }),
    { name: "SessionFlowStore" }
  )
);
