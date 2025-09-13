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

const getObfuscatedId = () => nanoid(6);

// Generate unique obfuscated ID that doesn't already exist
export const getUniqueObfuscatedId = (existingMap: Record<string, string>) => {
  let id;
  do {
    id = getObfuscatedId();
  } while (existingMap[id]);
  return id;
};

function encryptSession(session: Partial<Session>): PrismaSession {
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
    const encryptedData: EncryptedData = safeEncrypt(dataToEncrypt);
    sessionData = {
      ...sessionData,
      ...encryptedData,
    };
  }

  return sessionData as PrismaSession;
}

function decryptSession(encryptedSession: PrismaSession): Session {
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
    persistOnCloud: false, // Add default value
  };

  const parsedData = EncryptedDataSchema.safeParse(encryptedSession);

  if (parsedData.success) {
    const { data } = parsedData;
    const decryptedData = safeDecrypt<Partial<Session>>({
      encryptedData: data.encryptedData,
      iv: data.iv,
      authTag: data.authTag,
      encAlg: data.encAlg,
    } as EncryptedData);

    session = { ...session, ...decryptedData };
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
  sessions: Record<string, PrismaSession>;
  getSession: (obfuscatedId: string) => Session | null;
  setSession: (obfuscatedId: string, session: PrismaSession) => void;
  updateSession: (obfuscatedId: string, session: Session) => void;
  createSession: (data?: Partial<Session>) => string; // Return obfuscated ID
  resetSession: (obfuscatedId: string) => void;
  setSessions: (sessions: PrismaSession[]) => void;
  sessionExists: (id: string) => boolean; // New method
}

const initialState: Pick<EncryptedChatSessionStoreState, "sessionIdMap" | "sessions" | "hasHydrated"> = {
  sessionIdMap: {},
  sessions: {},
  hasHydrated: false,
};

export const useEncryptedChatSessionStore = create<EncryptedChatSessionStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      getSession: (obfuscatedId) => {
        const { sessionIdMap, sessions } = get();
        const sessionId = sessionIdMap[obfuscatedId];
        if (!sessionId) return null;

        const encryptedSession = sessions[obfuscatedId];
        if (!encryptedSession) return null;

        try {
          return decryptSession(encryptedSession);
        } catch (error) {
          console.error("Failed to decrypt session:", obfuscatedId, error);
          return null;
        }
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

      updateSession: (obfuscatedId, session) => {
        console.log("Updating session encrypted:", obfuscatedId);
        const { sessionIdMap } = get();
        const sessionId = sessionIdMap[obfuscatedId];
        if (!sessionId) {
          console.error("Session not found for obfuscated ID:", obfuscatedId);
          return;
        }

        try {
          const encryptedSession = encryptSession({
            ...session,
            id: sessionId,
            updatedAt: new Date(),
          });

          console.log("Updated session encrypted:", obfuscatedId, encryptedSession);

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

      createSession: (data = {}) => {
        const { sessionIdMap, sessions } = get();

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
          const encryptedSession = encryptSession(sessionData);

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

      resetSession: (obfuscatedId) => {
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
        const { sessionIdMap, sessions } = get();

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
    }),
    {
      name: "encrypted-chat-session-store",
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({
        sessionIdMap: state.sessionIdMap,
        sessions: state.sessions,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
      },
    }
  )
);

// Export helper hook for checking hydration
export const useIsSessionStoreHydrated = () => {
  return useEncryptedChatSessionStore((state) => state.hasHydrated);
};
