/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Encrypted Session Store with LRU Memory Management
 * Maximum 20 sessions in memory to prevent unbounded growth
 * Least recently accessed sessions evicted when limit reached
 */

import { Session as PrismaSession } from "@prisma/client";
import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getUniqueId } from "@/domains/encrypted-session/encrypted-session.utils";
import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";

// LRU cache configuration
const MAX_SESSIONS_IN_MEMORY = 20;

export interface SessionsStoreState extends PersistedStoreBaseProps {
  sessions: Record<string, PrismaSession>;
  publicIdMap: Record<string, string>; // publicId -> sessionId
  sessionIdMap: Record<string, string>; // sessionId -> publicId
  currentUserId: string | null; // Database user ID for filtering sessions
  sessionAccessOrder: string[]; // LRU tracking: most recent at end

  // Getters
  getSessionPublicId: (sessionId: string) => string | undefined;
  getSession: (sessionId: string) => PrismaSession | undefined;
  getCurrentUserSessions: () => PrismaSession[]; // Get all sessions for current user

  // Mutators
  setCurrentUserId: (userId: string | null) => void;
  setSession: (publicId: string, session: PrismaSession) => void;
  addSession: (session: PrismaSession) => void;
  updateSession: (
    sessionId: string,
    session: Partial<PrismaSession> | ((session: PrismaSession) => PrismaSession)
  ) => void;
  removeSession: (sessionId: string) => void;
  clearSession: (sessionId: string) => void;
  setSessions: (sessions: PrismaSession[]) => void;
  sessionExists: (sessionId: string) => boolean; // Now uses real session ID
}

const initialState: Pick<
  SessionsStoreState,
  "sessions" | "hasHydrated" | "publicIdMap" | "sessionIdMap" | "currentUserId" | "sessionAccessOrder"
> = {
  sessions: {},
  hasHydrated: false,
  publicIdMap: {},
  sessionIdMap: {},
  currentUserId: null,
  sessionAccessOrder: [],
};

/**
 * Helper: Update LRU access order (move session to end = most recently used)
 */
function updateAccessOrder(sessionId: string, accessOrder: string[]): string[] {
  const filtered = accessOrder.filter((id) => id !== sessionId);
  return [...filtered, sessionId];
}

/**
 * Helper: Evict least recently used session if limit exceeded
 */
function evictLRU(
  sessions: Record<string, PrismaSession>,
  publicIdMap: Record<string, string>,
  sessionIdMap: Record<string, string>,
  accessOrder: string[]
): {
  sessions: Record<string, PrismaSession>;
  publicIdMap: Record<string, string>;
  sessionIdMap: Record<string, string>;
  sessionAccessOrder: string[];
} {
  if (Object.keys(sessions).length <= MAX_SESSIONS_IN_MEMORY) {
    return { sessions, publicIdMap, sessionIdMap, sessionAccessOrder: accessOrder };
  }

  // Remove least recently used (first in array)
  const lruSessionId = accessOrder[0];
  if (!lruSessionId) return { sessions, publicIdMap, sessionIdMap, sessionAccessOrder: accessOrder };

  const lruPublicId = sessionIdMap[lruSessionId];

  const { [lruSessionId]: _, ...restSessions } = sessions;
  const { [lruPublicId]: __, ...restPublicIdMap } = publicIdMap;
  const { [lruSessionId]: ___, ...restSessionIdMap } = sessionIdMap;
  const newAccessOrder = accessOrder.slice(1); // Remove first element

  return {
    sessions: restSessions,
    publicIdMap: restPublicIdMap,
    sessionIdMap: restSessionIdMap,
    sessionAccessOrder: newAccessOrder,
  };
}

export const useSessionStore = create<SessionsStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setCurrentUserId: (userId) => set({ currentUserId: userId }),

      getSessionPublicId: (sessionId) => get().sessionIdMap[sessionId],

      getSession: (sessionId) => {
        const { sessions, currentUserId, sessionAccessOrder } = get();
        const session = sessions[sessionId];

        // Return session only if it belongs to current user
        if (!session || !currentUserId) return undefined;
        if (session.userId !== currentUserId) return undefined;

        // Update LRU access order (mark as most recently used)
        set({ sessionAccessOrder: updateAccessOrder(sessionId, sessionAccessOrder) });

        return session;
      },

      getCurrentUserSessions: () => {
        const { sessions, currentUserId } = get();
        if (!currentUserId) return [];

        return Object.values(sessions).filter((session) => session.userId === currentUserId);
      },

      addSession: (session) => {
        if (!session?.id) return;

        // Validate session belongs to current user
        const currentUserId = get().currentUserId;
        if (currentUserId && session.userId !== currentUserId) {
          return;
        }

        const publicId = getUniqueId(get().publicIdMap);
        set((state) => {
          // Add new session
          const newSessions = {
            ...state.sessions,
            [session.id]: session,
          };
          const newPublicIdMap = {
            ...state.publicIdMap,
            [publicId]: session.id,
          };
          const newSessionIdMap = {
            ...state.sessionIdMap,
            [session.id]: publicId,
          };
          const newAccessOrder = updateAccessOrder(session.id, state.sessionAccessOrder);

          // Evict LRU if necessary
          const evicted = evictLRU(newSessions, newPublicIdMap, newSessionIdMap, newAccessOrder);

          return evicted;
        });
      },

      setSession: (publicId, session) => {
        console.log("setSession", publicId, session);

        set((state) => {
          const oldSessionId = state.publicIdMap[publicId];
          if (!oldSessionId) return state;

          const newSessionId = session.id;

          // If the session ID hasn't changed → just update the session
          if (oldSessionId === newSessionId) {
            return {
              sessions: {
                ...state.sessions,
                [oldSessionId]: session,
              },
              sessionAccessOrder: updateAccessOrder(newSessionId, state.sessionAccessOrder),
            };
          }

          // Session ID has changed → update maps + sessions
          const { [oldSessionId]: _, ...restSessions } = state.sessions;
          const { [publicId]: __, ...restPublicIdMap } = state.publicIdMap;
          const { [oldSessionId]: ___, ...restSessionIdMap } = state.sessionIdMap;

          // Remove old session from access order, add new one
          const filteredOrder = state.sessionAccessOrder.filter((id) => id !== oldSessionId);
          const newAccessOrder = updateAccessOrder(newSessionId, filteredOrder);

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
            sessionAccessOrder: newAccessOrder,
          };
        });
      },

      updateSession: (sessionId, patch) => {
        set((state) => {
          const current = state.sessions[sessionId];
          if (!current) return state;

          const updated = typeof patch === "function" ? patch(current) : { ...current, ...patch };

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: updated,
            },
            sessionAccessOrder: updateAccessOrder(sessionId, state.sessionAccessOrder),
          };
        });
      },

      removeSession: (sessionId) => {
        set((state) => {
          const publicId = state.getSessionPublicId(sessionId);
          if (!publicId) return state;

          const { [sessionId]: _, ...restSessions } = state.sessions;
          const { [publicId]: __, ...restPublicIdMap } = state.publicIdMap;
          const { [sessionId]: ___, ...restSessionIdMap } = state.sessionIdMap;

          return {
            sessions: restSessions,
            publicIdMap: restPublicIdMap,
            sessionIdMap: restSessionIdMap,
            sessionAccessOrder: state.sessionAccessOrder.filter((id) => id !== sessionId),
          };
        });
      },

      clearSession: (sessionId) => {
        set((state) => {
          const current = state.sessions[sessionId];
          if (!current) return state;

          // Replace with a fresh PrismaSession shape
          // NOTE: serverData moved to separate SessionContext table
          const reset: PrismaSession = {
            id: current.id,
            userId: current.userId,
            title: current.title,
            subtitle: current.subtitle,
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
            sessionAccessOrder: updateAccessOrder(sessionId, state.sessionAccessOrder),
          };
        });
      },

      setSessions: (sessions) => {
        const currentUserId = get().currentUserId;
        const newSessions: Record<string, PrismaSession> = {};
        const newPublicIdMap: Record<string, string> = {};
        const newSessionIdMap: Record<string, string> = {};
        const newAccessOrder: string[] = [];

        sessions.forEach((s) => {
          // Only add sessions belonging to current user
          if (currentUserId && s.userId !== currentUserId) {
            return; // Skip sessions from other users
          }

          const publicId = getUniqueId(newPublicIdMap);
          newSessions[s.id] = s;
          newPublicIdMap[publicId] = s.id;
          newSessionIdMap[s.id] = publicId;
          newAccessOrder.push(s.id); // Add to access order
        });

        // If we exceed MAX_SESSIONS_IN_MEMORY, keep only the most recent
        if (newAccessOrder.length > MAX_SESSIONS_IN_MEMORY) {
          // Keep only the last MAX_SESSIONS_IN_MEMORY sessions
          const sessionsToKeep = newAccessOrder.slice(-MAX_SESSIONS_IN_MEMORY);
          const sessionsToRemove = newAccessOrder.slice(0, -MAX_SESSIONS_IN_MEMORY);

          // Remove old sessions
          sessionsToRemove.forEach((sessionId) => {
            const publicId = newSessionIdMap[sessionId];
            delete newSessions[sessionId];
            delete newPublicIdMap[publicId];
            delete newSessionIdMap[sessionId];
          });

          set({
            sessions: newSessions,
            publicIdMap: newPublicIdMap,
            sessionIdMap: newSessionIdMap,
            sessionAccessOrder: sessionsToKeep,
          });
        } else {
          set({
            sessions: newSessions,
            publicIdMap: newPublicIdMap,
            sessionIdMap: newSessionIdMap,
            sessionAccessOrder: newAccessOrder,
          });
        }
      },

      sessionExists: (sessionId) => {
        const { sessions, currentUserId } = get();
        const session = sessions[sessionId];

        if (!session || !currentUserId) return false;
        return session.userId === currentUserId;
      },
    }),
    {
      name: "session-store",
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({
        publicIdMap: state.publicIdMap,
        sessionIdMap: state.sessionIdMap,
        sessions: state.sessions,
        currentUserId: state.currentUserId,
        sessionAccessOrder: state.sessionAccessOrder,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);

          // Enforce LRU limit on hydration (in case user had > MAX_SESSIONS_IN_MEMORY from older version)
          const { sessions, publicIdMap, sessionIdMap, sessionAccessOrder } = state;
          if (Object.keys(sessions).length > MAX_SESSIONS_IN_MEMORY) {
            const evicted = evictLRU(sessions, publicIdMap, sessionIdMap, sessionAccessOrder);
            state.setSessions(Object.values(evicted.sessions));
          }
        }
      },
    }
  )
);
