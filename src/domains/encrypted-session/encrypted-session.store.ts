/* eslint-disable @typescript-eslint/no-unused-vars */
import { Session as PrismaSession } from "@prisma/client";
import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getUniqueId } from "@/domains/encrypted-session/encrypted-session.utils";
import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";

export interface SessionsStoreState extends PersistedStoreBaseProps {
  sessions: Record<string, PrismaSession>;
  publicIdMap: Record<string, string>; // publicId -> sessionId
  sessionIdMap: Record<string, string>; // sessionId -> publicId

  // Getters
  getSessionPublicId: (sessionId: string) => string | undefined;
  getSession: (sessionId: string) => PrismaSession | undefined;

  // Mutators
  setSession: (publicId: string, session: PrismaSession) => void;
  addSession: (session: PrismaSession) => void;
  updateSession: (
    publicId: string,
    session: Partial<PrismaSession> | ((session: PrismaSession) => PrismaSession)
  ) => void;
  removeSession: (publicId: string) => void;
  clearSession: (publicId: string) => void;
  setSessions: (sessions: PrismaSession[]) => void;
  sessionExists: (sessionId: string) => boolean; // Now uses real session ID
}

const initialState: Pick<SessionsStoreState, "sessions" | "hasHydrated" | "publicIdMap" | "sessionIdMap"> = {
  sessions: {},
  hasHydrated: false,
  publicIdMap: {},
  sessionIdMap: {},
};

export const useSessionStore = create<SessionsStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      getSessionPublicId: (sessionId) => get().sessionIdMap[sessionId],

      getSession: (sessionId) => get().sessions[sessionId],

      addSession: (session) => {
        if (!session?.id) return;
        const publicId = getUniqueId(get().publicIdMap);
        set((state) => ({
          sessions: {
            ...state.sessions,
            [session.id]: session,
          },
          publicIdMap: {
            ...state.publicIdMap,
            [publicId]: session.id,
          },
          sessionIdMap: {
            ...state.sessionIdMap,
            [session.id]: publicId,
          },
        }));
      },

      setSession: (publicId, session) => {
        set((state) => {
          const oldSessionId = state.publicIdMap[publicId];
          if (!oldSessionId) return state;

          const newSessionId = session.id;

          // If the session ID hasn’t changed → just update the session
          if (oldSessionId === newSessionId) {
            return {
              sessions: {
                ...state.sessions,
                [oldSessionId]: session,
              },
            };
          }

          // Session ID has changed → update maps + sessions
          const { [oldSessionId]: _, ...restSessions } = state.sessions;
          const { [publicId]: __, ...restPublicIdMap } = state.publicIdMap;
          const { [oldSessionId]: ___, ...restSessionIdMap } = state.sessionIdMap;

          return {
            sessions: {
              ...restSessions,
              [newSessionId]: session,
            },
            publicIdMap: {
              ...restPublicIdMap,
              [publicId]: newSessionId,
            },
            sessionIdMap: {
              ...restSessionIdMap,
              [newSessionId]: publicId,
            },
          };
        });
      },

      updateSession: (publicId, patch) => {
        set((state) => {
          const sessionId = state.publicIdMap[publicId];
          if (!sessionId) return state;

          const current = state.sessions[sessionId];
          if (!current) return state;

          const updated = typeof patch === "function" ? patch(current) : { ...current, ...patch };

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: updated,
            },
          };
        });
      },

      removeSession: (publicId) => {
        set((state) => {
          const sessionId = state.publicIdMap[publicId];
          if (!sessionId) return state;

          const { [sessionId]: _, ...restSessions } = state.sessions;
          const { [publicId]: __, ...restPublicIdMap } = state.publicIdMap;
          const { [sessionId]: ___, ...restSessionIdMap } = state.sessionIdMap;

          return {
            sessions: restSessions,
            publicIdMap: restPublicIdMap,
            sessionIdMap: restSessionIdMap,
          };
        });
      },

      clearSession: (publicId) => {
        set((state) => {
          const sessionId = state.publicIdMap[publicId];
          if (!sessionId) return state;
          const current = state.sessions[sessionId];
          if (!current) return state;

          // Replace with a fresh PrismaSession shape
          const reset: PrismaSession = {
            id: current.id,
            userId: current.userId,
            title: current.title,
            subtitle: current.subtitle,
            modelCode: current.modelCode,
            autoUpdateTitle: current.autoUpdateTitle,
            persistOnCloud: current.persistOnCloud,
            metadata: {
              tokenUsage: [],
              messageCount: 0,
              tokenCount: 0,
              costUSD: 0,
            },
            encryptedData: null,
            createdAt: current.createdAt,
            updatedAt: new Date(),
          };

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: reset,
            },
          };
        });
      },

      setSessions: (sessions) => {
        const newSessions: Record<string, PrismaSession> = {};
        const newPublicIdMap: Record<string, string> = {};
        const newSessionIdMap: Record<string, string> = {};

        sessions.forEach((s) => {
          const publicId = getUniqueId(newPublicIdMap);
          newSessions[s.id] = s;
          newPublicIdMap[publicId] = s.id;
          newSessionIdMap[s.id] = publicId;
        });

        set({
          sessions: newSessions,
          publicIdMap: newPublicIdMap,
          sessionIdMap: newSessionIdMap,
        });
      },

      sessionExists: (sessionId) => {
        const { sessions } = get();
        return Boolean(sessions[sessionId]);
      },
    }),
    {
      name: "session-store",
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({
        publicIdMap: state.publicIdMap,
        sessionIdMap: state.sessionIdMap,
        sessions: state.sessions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    }
  )
);
