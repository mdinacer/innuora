import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";

const createDefaultSession = (): SessionFlowState => ({
  inputValues: {},
  currentStepId: null,
  isFlowStarted: false,
  isFlowEnded: false,
  logs: [],
  reflections: [],
  chatSummary: null,
  lastAccessedAt: null,
});

export interface SessionFlowState {
  inputValues: Record<string, any>;
  currentStepId: string | null;
  isFlowStarted: boolean;
  isFlowEnded: boolean;
  logs: string[];
  reflections: string[];
  chatSummary: string | null;
  lastAccessedAt: number | null;
}

interface SessionStoresState extends PersistedStoreBaseProps {
  sessions: Record<string, SessionFlowState>;

  updateSession: (
    sessionId: string,
    updates: Partial<SessionFlowState> | ((prev: SessionFlowState) => SessionFlowState)
  ) => void;

  setChatSummary: (sessionId: string, summary: string | null) => void;
  setInputValues: (
    sessionId: string,
    inputValues: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)
  ) => void;

  setCurrentStepId: (sessionId: string, stepId: string | ((prev: string | null) => string | null)) => void;

  markStarted: (sessionId: string) => void;
  markEnded: (sessionId: string) => void;
  resetSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;

  setSessions: (
    sessions:
      | Record<string, SessionFlowState>
      | ((prev: Record<string, SessionFlowState>) => Record<string, SessionFlowState>)
  ) => void;
  createSession: (sessionId: string) => void;
}

export const useSessionStore = create<SessionStoresState>()(
  devtools(
    persist(
      (set, get) => ({
        sessions: {},
        hasHydrated: false,

        createSession: (sessionId) =>
          set((state) => {
            if (state.sessions[sessionId]) return state;

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: createDefaultSession(),
              },
            };
          }),

        setSessions: (sessions) =>
          set((state) => {
            return {
              sessions: typeof sessions === "function" ? sessions(state.sessions) : sessions,
            };
          }),

        updateSession: (sessionId, updates) =>
          set(
            (state) => {
              const prevSession = state.sessions[sessionId];
              if (!prevSession) {
                if (process.env.NODE_ENV !== "production") {
                  console.warn(`[updateSession] Tried to update missing session: ${sessionId}`);
                }
                return state; // no-op
              }

              const newSession = typeof updates === "function" ? updates(prevSession) : { ...prevSession, ...updates };

              return {
                sessions: {
                  ...state.sessions,
                  [sessionId]: newSession,
                },
              };
            },
            false,
            "updateSession"
          ),

        setChatSummary: (sessionId, summary) =>
          get().updateSession(sessionId, (prev) => ({
            ...prev,
            chatSummary: summary,
          })),

        setInputValues: (sessionId, inputValues) =>
          get().updateSession(sessionId, (prev) => ({
            ...prev,
            inputValues: typeof inputValues === "function" ? inputValues(prev.inputValues) : inputValues,
          })),

        setCurrentStepId: (sessionId, stepId) =>
          get().updateSession(sessionId, (prev) => ({
            ...prev,
            currentStepId: typeof stepId === "function" ? stepId(prev.currentStepId) : stepId,
          })),

        markStarted: (sessionId) =>
          get().updateSession(sessionId, (prev) => ({
            ...prev,
            isFlowStarted: true,
            isFlowEnded: false,
          })),

        markEnded: (sessionId) =>
          get().updateSession(sessionId, (prev) => ({
            ...prev,
            isFlowEnded: true,
          })),

        resetSession: (sessionId) =>
          set((state) => {
            if (!state.sessions[sessionId]) return state;
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: createDefaultSession(),
              },
            };
          }),

        deleteSession: (sessionId) =>
          set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [sessionId]: _, ...rest } = state.sessions;
            return { sessions: rest };
          }),

        setHasHydrated: (state) => {
          set({
            hasHydrated: state,
          });
        },
      }),
      {
        name: "sessions-store",
        storage: createJSONStorage(() => localforage),
        partialize: (state) => ({ sessions: state.sessions }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true);
          }
        },
      }
    ),
    { name: "SessionsStore" }
  )
);
