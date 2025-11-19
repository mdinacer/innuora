/* eslint-disable @typescript-eslint/no-unused-vars */
import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { EncryptedSession } from "@/domains/guidance-flow/types/session-server";
import { getUniqueId } from "@/domains/guidance-flow/utils/session-utils";
import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";

interface SessionStoreState extends PersistedStoreBaseProps {
  sessions: Record<string, EncryptedSession>; // maps publicId → session
  sessionIdMap: Record<string, string>; // maps publicId → realId
  publicIdMap: Record<string, string>; // maps realId → publicId

  getSessionById: (sessionId: string) => EncryptedSession | undefined;
  getSessionByPublicId: (publicId: string) => EncryptedSession | undefined;
  getPublicId: (sessionId: string) => string | undefined;
  getSessionId: (publicId: string) => string | undefined;
  addSession: (session: EncryptedSession) => string; // returns publicId
  updateSession: (
    sessionId: string,
    updater: Partial<EncryptedSession> | ((session: EncryptedSession) => EncryptedSession)
  ) => void;
  removeSession: (sessionId: string) => void;
  resetSession: (sessionId: string) => void;
  setSessions: (sessions: EncryptedSession[]) => void;
  clearStore: () => void;
}

const initialStoreState: Pick<SessionStoreState, "sessions" | "hasHydrated" | "publicIdMap" | "sessionIdMap"> = {
  sessions: {},
  hasHydrated: false,
  publicIdMap: {},
  sessionIdMap: {},
};

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      /** Retrieve session by real ID */
      getSessionById: (sessionId) => {
        const publicId = get().publicIdMap[sessionId];
        return publicId ? get().sessions[publicId] : undefined;
      },

      /** Retrieve session by public ID */
      getSessionByPublicId: (publicId) => get().sessions[publicId],

      /** Retrieve publicId by real sessionId */
      getPublicId: (sessionId) => get().publicIdMap[sessionId],

      /** Retrieve real sessionId by publicId */
      getSessionId: (publicId) => get().sessionIdMap[publicId],

      /** Add a new session with generated obfuscated publicId */
      addSession: (session) => {
        const { id } = session;
        const current = get();

        const publicId = current.publicIdMap[id] || getUniqueId(current.publicIdMap);

        set({
          sessions: { ...current.sessions, [publicId]: session },
          publicIdMap: { ...current.publicIdMap, [id]: publicId },
          sessionIdMap: { ...current.sessionIdMap, [publicId]: id },
        });

        return publicId;
      },

      /** Update an existing session (by real ID) */
      updateSession: (sessionId, updater) => {
        const { publicIdMap, sessions } = get();
        const publicId = publicIdMap[sessionId];
        if (!publicId) return;

        const existing = sessions[publicId];
        if (!existing) return;

        const updated =
          typeof updater === "function"
            ? (updater as (s: EncryptedSession) => EncryptedSession)(existing)
            : { ...existing, ...updater };

        set({
          sessions: { ...sessions, [publicId]: updated },
        });
      },

      /** Remove a session (and both mapping directions) */
      removeSession: (sessionId) => {
        const current = get();
        const publicId = current.publicIdMap[sessionId];
        if (!publicId) return;

        const { [publicId]: _, ...restSessions } = current.sessions;
        const { [sessionId]: __, ...restPublicMap } = current.publicIdMap;
        const { [publicId]: ___, ...restSessionMap } = current.sessionIdMap;

        set({
          sessions: restSessions,
          publicIdMap: restPublicMap,
          sessionIdMap: restSessionMap,
        });
      },

      /** Reset (clear) a specific session’s content but keep mappings */
      resetSession: (sessionId) => {
        const { publicIdMap, sessions } = get();
        const publicId = publicIdMap[sessionId];
        if (!publicId) return;

        const existing = sessions[publicId];
        if (!existing) return;

        const reset: EncryptedSession = { ...existing, messages: null };

        set({
          sessions: { ...sessions, [publicId]: reset },
        });
      },

      /** Replace all sessions at once */
      setSessions: (sessions) => {
        const publicIdMap: Record<string, string> = {};
        const sessionIdMap: Record<string, string> = {};
        const sessionsMap: Record<string, EncryptedSession> = {};

        sessions.forEach((s) => {
          const publicId = getUniqueId(get().publicIdMap);
          sessionsMap[publicId] = s;
          publicIdMap[s.id] = publicId;
          sessionIdMap[publicId] = s.id;
        });

        set({
          sessions: sessionsMap,
          publicIdMap,
          sessionIdMap,
        });
      },

      /** Clear everything */
      clearStore: () => set(initialStoreState),
    }),
    {
      name: "local-session-store",
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
