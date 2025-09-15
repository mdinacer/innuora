/* eslint-disable @typescript-eslint/no-unused-vars */
import { Session as PrismaSession } from "@prisma/client";
import localforage from "localforage";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Session, SessionMeta, SessionMetadataSchema } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { MODELS_CODES } from "@/lib/constants/ai-models";
import { safeDecrypt, safeEncrypt } from "@/lib/crypto/encryption";
import { EncryptedData, EncryptedDataSchema } from "@/lib/crypto/encryption.types";
import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";

const DEFAULT_MODEL_CODE = process.env.NEXT_PUBLIC_DEFAULT_MODEL_CODE ?? MODELS_CODES.M1;

function sessionToStorage(session: PrismaSession): Record<keyof PrismaSession, any> {
  const storageSession = { ...session } as Record<keyof PrismaSession, any>;

  // Only convert Uint8Array fields if all encryption fields are present
  const hasEncryptedData = session.encryptedData && session.iv && session.authTag && session.encAlg;

  if (!hasEncryptedData) {
    storageSession.encryptedData = null;
    storageSession.iv = null;
    storageSession.authTag = null;
    storageSession.encAlg = null;
    return storageSession;
  }

  if (hasEncryptedData) {
    if (storageSession.encryptedData instanceof Uint8Array) {
      storageSession.encryptedData = Array.from(storageSession.encryptedData);
    }
    if (storageSession.iv instanceof Uint8Array) {
      storageSession.iv = Array.from(storageSession.iv);
    }
    if (storageSession.authTag instanceof Uint8Array) {
      storageSession.authTag = Array.from(storageSession.authTag);
    }
  }

  return storageSession;
}

// Helper function to convert storage data back to session
function storageToSession(storageData: Record<string, any>): PrismaSession {
  const session = { ...storageData } as PrismaSession;

  // Only convert arrays back to Uint8Array if all encryption fields are present
  const hasEncryptedData = storageData.encryptedData && storageData.iv && storageData.authTag && storageData.encAlg;

  if (!hasEncryptedData) {
    return {
      ...session,
      encryptedData: null,
      iv: null,
      authTag: null,
      encAlg: null,
    };
  }

  if (hasEncryptedData) {
    if (Array.isArray(session.encryptedData)) {
      session.encryptedData = new Uint8Array(session.encryptedData);
    }
    if (Array.isArray(session.iv)) {
      session.iv = new Uint8Array(session.iv);
    }
    if (Array.isArray(session.authTag)) {
      session.authTag = new Uint8Array(session.authTag);
    }
  }

  return session as PrismaSession;
}

const getObfuscatedId = () => nanoid(6);

// Generate unique obfuscated ID that doesn't already exist
export const getUniqueObfuscatedId = (existingMap: Record<string, string>) => {
  let id;
  do {
    id = getObfuscatedId();
  } while (existingMap[id]);
  return id;
};

export type SessionChangeState = { obfuscatedId?: string | null; state: "new" | "modified"; updatedAt: Date };

async function encryptSession(session: Partial<Session>): Promise<PrismaSession> {
  const { messages = [], memoryStore, continuitySummary, aggregatedAnalysis, analysisSnapshots, ...rest } = session;
  let sessionData: Partial<PrismaSession> = {
    ...rest,
    metadata: {
      ...rest.metadata,
      tokenUsage: [],
    },
  };

  const hasData = messages?.length > 0;

  if (hasData) {
    const dataToEncrypt = {
      messages,
      ...(memoryStore ? { memoryStore } : {}),
      ...(continuitySummary ? { continuitySummary } : {}),
      ...(aggregatedAnalysis ? { aggregatedAnalysis } : {}),
      ...(analysisSnapshots ? { analysisSnapshots } : {}),
    };
    const encryptedData: EncryptedData = await safeEncrypt(dataToEncrypt);
    sessionData = {
      ...sessionData,
      ...encryptedData,
    };
  }

  return sessionData as PrismaSession;
}

async function decryptSession(encryptedSession: PrismaSession): Promise<Session> {
  let session: Session = {
    id: encryptedSession.id,
    title: encryptedSession.title,
    subtitle: encryptedSession.subtitle ?? "",
    modelCode: encryptedSession.modelCode ?? DEFAULT_MODEL_CODE,
    autoUpdateTitle: encryptedSession.autoUpdateTitle ?? false,
    // Timestamps
    createdAt: encryptedSession.createdAt,
    updatedAt: encryptedSession.updatedAt,
    //Sensitive data
    messages: [],
    memoryStore: null,
    continuitySummary: null,
    aggregatedAnalysis: null,
    metadata: (encryptedSession.metadata
      ? { ...SessionMetadataSchema.parse(encryptedSession.metadata), tokenUsage: [] }
      : { messageCount: 0, tokenCount: 0, costUSD: 0, tokenUsage: [] }) as SessionMeta,
    analysisSnapshots: [],
    persistOnCloud: encryptedSession.persistOnCloud ?? false,
  };

  const parsedData = EncryptedDataSchema.safeParse(encryptedSession);

  if (parsedData.success) {
    const { data } = parsedData;
    const decryptedData = await safeDecrypt<Partial<Session>>({
      encryptedData: data.encryptedData,
      iv: data.iv,
      authTag: data.authTag,
      encAlg: data.encAlg,
    } as EncryptedData);

    session = { ...session, ...decryptedData } as Session;
  }

  return session;
}

const initialSessionData: Omit<Session, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  subtitle: undefined,
  messages: [],
  memoryStore: null,
  continuitySummary: null,
  aggregatedAnalysis: null,
  analysisSnapshots: [],
  modelCode: "M1",
  autoUpdateTitle: false,
  persistOnCloud: false,
  metadata: {
    tokenUsage: [],
    messageCount: 0,
    tokenCount: 0,
    costUSD: 0,
  },
};

interface EncryptedChatSessionStoreState extends PersistedStoreBaseProps {
  sessionIdMap: Record<string, string>; // obfuscatedId -> sessionId
  onlineSessionIds: string[]; // Uses Session ID
  sessionsChangesMap: Record<string, SessionChangeState>; //
  sessions: Record<string, PrismaSession>;
  getSession: (obfuscatedId: string) => Promise<Session | null>;
  getSessionObfuscatedId: (sessionId: string) => string | undefined;
  setSession: (obfuscatedId: string, session: PrismaSession) => void;
  updateSession: (obfuscatedId: string, session: Session) => void;
  createSession: (data?: Partial<Session>) => Promise<string>; // Return obfuscated ID
  resetSession: (obfuscatedId: string) => void;
  removeSession: (obfuscatedId: string) => void;
  setSessions: (sessions: PrismaSession[]) => void;
  sessionExists: (id: string) => boolean; // New method
  addOnlineSessionId: (obfuscatedId: string) => void;
  setChangesMap: (
    changes:
      | Record<string, SessionChangeState>
      | ((prevMap: Record<string, SessionChangeState>) => Record<string, SessionChangeState>)
  ) => void;
  removeOnlineSessionId: (obfuscatedId: string) => void;
}

const initialState: Pick<
  EncryptedChatSessionStoreState,
  "sessionIdMap" | "sessions" | "hasHydrated" | "onlineSessionIds" | "sessionsChangesMap"
> = {
  sessionIdMap: {},
  sessions: {},
  hasHydrated: false,
  sessionsChangesMap: {},
  onlineSessionIds: [],
};

export const useEncryptedChatSessionStore = create<EncryptedChatSessionStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addOnlineSessionId: (obfuscatedId) => {
        set(({ sessionIdMap, onlineSessionIds, ...rest }) => {
          if (onlineSessionIds.includes(obfuscatedId)) {
            return {};
          }
          return {
            ...rest,
            onlineSessionIds: [...onlineSessionIds, obfuscatedId],
          };
        });
      },

      removeOnlineSessionId: (id) => {
        set((state) => ({
          onlineSessionIds: state.onlineSessionIds.filter((sid) => sid !== id),
        }));
      },

      getSession: async (obfuscatedId) => {
        const { sessionIdMap, sessions } = get();
        const sessionId = sessionIdMap[obfuscatedId];
        if (!sessionId) return null;

        const encryptedSession = sessions[obfuscatedId];
        if (!encryptedSession) return null;

        try {
          return await decryptSession(encryptedSession);
        } catch (error) {
          console.error("Failed to decrypt session:", obfuscatedId, error);
          return null;
        }
      },

      getSessionObfuscatedId: (sessionId) => {
        const { sessionIdMap } = get();
        return Object.entries(sessionIdMap).find(([, id]) => id === sessionId)?.[0];
      },

      setSession: (obfuscatedId, session) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [obfuscatedId]: session,
          },
          sessionIdMap: {
            ...state.sessionIdMap,
            [obfuscatedId]: session.id,
          },
        })),

      updateSession: async (obfuscatedId, session) => {
        const { sessionIdMap } = get();
        const sessionId = sessionIdMap[obfuscatedId];
        if (!sessionId) {
          console.error("Session not found for obfuscated ID:", obfuscatedId);
          return;
        }

        try {
          const encryptedSession = await encryptSession({
            ...session,
            id: sessionId,
            updatedAt: new Date(),
          });

          set((state) => ({
            sessions: {
              ...state.sessions,
              [obfuscatedId]: encryptedSession,
            },
          }));
        } catch (error) {
          console.error("Failed to encrypt session:", obfuscatedId, error);
        }
      },

      createSession: async (data = {}) => {
        const { sessionIdMap } = get();

        // Generate IDs
        const sessionId = data?.id ?? crypto.randomUUID();
        const obfuscatedId = getUniqueObfuscatedId(sessionIdMap);

        // Check if session ID already exists
        if (Object.values(sessionIdMap).includes(sessionId)) {
          console.error("Session with this ID already exists", sessionId);
          throw new Error("Session already exists");
        }

        const now = new Date();
        const sessionData = {
          ...initialSessionData,
          ...data,
          id: sessionId,
          createdAt: data.createdAt ?? now,
          updatedAt: data.updatedAt ?? now,
        };

        try {
          const encryptedSession = await encryptSession(sessionData);

          set((state) => ({
            sessionIdMap: {
              ...state.sessionIdMap,
              [obfuscatedId]: sessionId,
            },
            sessions: {
              ...state.sessions,
              [obfuscatedId]: encryptedSession,
            },
          }));

          return obfuscatedId;
        } catch (error) {
          console.error("Failed to create session:", error);
          throw error;
        }
      },

      removeSession: (obfuscatedId) => {
        const { sessionIdMap } = get();
        const sessionId = sessionIdMap[obfuscatedId];

        if (!sessionId) {
          console.error("Session not found for obfuscated ID:", obfuscatedId);
          return;
        }

        set((state) => {
          // Remove from both maps
          const { [obfuscatedId]: removedSession, ...restSessions } = state.sessions;
          const { [obfuscatedId]: removedMapping, ...restMappings } = state.sessionIdMap;

          return {
            sessions: restSessions,
            sessionIdMap: restMappings,
          };
        });
      },
      resetSession: (obfuscatedId) => {
        const { sessionIdMap } = get();
        const sessionId = sessionIdMap[obfuscatedId];

        if (!sessionId) {
          console.error("Session not found for obfuscated ID:", obfuscatedId);
          return;
        }

        const session = get().sessions[obfuscatedId];
        if (!session) {
          console.error("Session not found for obfuscated ID:", obfuscatedId);
          return;
        }

        const now = new Date();
        const emptySession: PrismaSession = {
          ...session,
          metadata: {
            messagesCount: 0,
            tokensCount: 0,
            tokenUsage: [],
            costUSD: 0,
          },
          encryptedData: null,
          iv: null,
          authTag: null,
          encAlg: null,
          updatedAt: now,
        };

        get().setSession(obfuscatedId, emptySession);
      },

      setSessions: (sessions) => {
        // Clear existing data and set new sessions
        const newSessionIdMap: Record<string, string> = {};
        const newSessions: Record<string, PrismaSession> = {};

        sessions.forEach((session) => {
          const obfuscatedId = getUniqueObfuscatedId(newSessionIdMap);
          newSessionIdMap[obfuscatedId] = session.id;
          newSessions[obfuscatedId] = session;
        });

        set({
          sessionIdMap: newSessionIdMap,
          sessions: newSessions,
        });
      },

      sessionExists: (id) => {
        const { sessionIdMap } = get();

        // Check if it's an obfuscated ID (exists as key in sessionIdMap)
        if (sessionIdMap[id]) {
          return true;
        }

        // Check if it's a session ID (exists as value in sessionIdMap)
        if (Object.values(sessionIdMap).includes(id)) {
          return true;
        }

        return false;
      },

      setChangesMap: (changes) =>
        set((state) => {
          if (typeof changes === "function") {
            // Functional update
            return { sessionsChangesMap: changes(state.sessionsChangesMap) };
          }
          // Direct replacement / merge
          return {
            sessionsChangesMap: {
              ...state.sessionsChangesMap,
              ...changes,
            },
          };
        }),
    }),
    {
      name: "encrypted-chat-session-store",
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({
        sessionIdMap: state.sessionIdMap,
        // sessions: state.sessions,
        sessions: Object.fromEntries(
          Object.entries(state.sessions).map(([key, session]) => [key, sessionToStorage(session)])
        ),
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.sessions) {
          state.sessions = Object.fromEntries(
            Object.entries(state.sessions).map(([key, storageData]) => [
              key,
              storageToSession(storageData as Record<string, any>),
            ])
          );
        }
        state.setHasHydrated(true);
      },
    }
  )
);

// Export helper hook for checking hydration
export const useIsSessionStoreHydrated = () => {
  return useEncryptedChatSessionStore((state) => state.hasHydrated);
};
