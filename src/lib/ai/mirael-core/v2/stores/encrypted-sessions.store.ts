import { Session as PrismaSession } from "@prisma/client";
import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Session, SessionMeta, SessionMetadataSchema } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { MODELS_CODES } from "@/lib/constants/ai-models";
import { decryptObjectWithKey, encryptObjectWithKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob, EncryptedBlobSchema } from "@/lib/crypto/webcrypto-crypto.types";
import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";

const DEFAULT_MODEL_CODE = process.env.NEXT_PUBLIC_DEFAULT_MODEL_CODE ?? MODELS_CODES.M1;

// Generate unique obfuscated ID that doesn't already exist
// export const getUniqueObfuscatedId = (existingMap: Record<string, string>) => {
//   let id;
//   do {
//     id = nanoid(6);
//   } while (existingMap[id]);
//   return id;
// };

export type SessionChangeState = { sessionId?: string | null; state: "new" | "modified"; updatedAt: Date };

async function encryptSession(session: Partial<Session>): Promise<PrismaSession> {
  const contentKey = await getStoredContentKey();

  if (!contentKey) {
    throw new Error("No content key found");
  }
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
    const encryptedData: EncryptedBlob = await encryptObjectWithKey(dataToEncrypt, contentKey);
    sessionData = {
      ...sessionData,
      encryptedData,
    };
  }

  return sessionData as PrismaSession;
}

async function decryptSession(encryptedSession: PrismaSession): Promise<Session> {
  const contentKey = await getStoredContentKey();

  if (!contentKey) {
    throw new Error("No content key found");
  }
  let session: Session = {
    id: encryptedSession.id,
    userId: encryptedSession.userId,
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

  const parsedData = EncryptedBlobSchema.safeParse(encryptedSession);

  if (parsedData.success) {
    const { data } = parsedData;
    const decryptedData = await decryptObjectWithKey<Partial<Session>>(data, contentKey);

    session = { ...session, ...decryptedData } as Session;
  }

  return session;
}

const initialSessionData: Omit<Session, "id" | "createdAt" | "updatedAt"> = {
  userId: "",
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

//const findOneLiner = (r: Record<string, string>, s: string) => Object.keys(r).find((k) => r[k] === s);

interface EncryptedChatSessionStoreState extends PersistedStoreBaseProps {
  onlineSessionIds: string[]; // Uses real Session IDs
  changesMap: Record<string, SessionChangeState>; //
  sessions: Record<string, PrismaSession>; // Now keyed by real session ID
  getSession: (sessionId: string) => Promise<Session | null>;
  setSession: (sessionId: string, session: PrismaSession) => void;
  updateSession: (sessionId: string, session: Session) => void;
  createSession: (data?: Partial<Session>) => Promise<string>; // Return real session ID
  resetSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  setSessions: (sessions: PrismaSession[]) => void;
  sessionExists: (sessionId: string) => boolean; // Now uses real session ID
  addOnlineSessionId: (sessionId: string) => void;
  setChangesMap: (
    changes:
      | Record<string, SessionChangeState>
      | ((prevMap: Record<string, SessionChangeState>) => Record<string, SessionChangeState>)
  ) => void;
  removeOnlineSessionId: (sessionId: string) => void;
  // Migration helper
}

const initialState: Pick<
  EncryptedChatSessionStoreState,
  "sessions" | "hasHydrated" | "onlineSessionIds" | "changesMap"
> = {
  sessions: {},
  hasHydrated: false,
  changesMap: {},
  onlineSessionIds: [],
};

export const useEncryptedSessionStore = create<EncryptedChatSessionStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addOnlineSessionId: (sessionId) => {
        set(({ onlineSessionIds, ...rest }) => {
          if (onlineSessionIds.includes(sessionId)) {
            return {};
          }
          return {
            ...rest,
            onlineSessionIds: [...onlineSessionIds, sessionId],
          };
        });
      },

      removeOnlineSessionId: (sessionId) => {
        set((state) => ({
          onlineSessionIds: state.onlineSessionIds.filter((sid) => sid !== sessionId),
        }));
      },

      getSession: async (sessionId) => {
        const { sessions } = get();
        const encryptedSession = sessions[sessionId];
        if (!encryptedSession) return null;

        try {
          return await decryptSession(encryptedSession);
        } catch (error) {
          console.error("Failed to decrypt session:", sessionId, error);
          return null;
        }
      },

      setSession: (obfuscatedId, session) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [session.id]: session,
          },
        }));
      },

      updateSession: async (sessionId, session) => {
        const { sessions } = get();
        if (!sessions[sessionId]) {
          console.error("Session not found:", sessionId);
          return;
        }

        console.log("Updating session:", sessionId, session);

        try {
          const encryptedSession = await encryptSession({
            ...session,
            id: sessionId,
            updatedAt: new Date(),
          });

          const testDecryptedSession = await decryptSession(encryptedSession);

          console.log("Decrypted session:", testDecryptedSession);

          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: encryptedSession,
            },
          }));
        } catch (error) {
          console.error("Failed to encrypt session:", sessionId, error);
        }
      },

      createSession: async (data = {}) => {
        const { sessions } = get();

        // Generate real session ID
        const sessionId = data?.id ?? crypto.randomUUID();

        // Check if session ID already exists
        if (sessions[sessionId]) {
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
            sessions: {
              ...state.sessions,
              [sessionId]: encryptedSession,
            },
          }));

          return sessionId;
        } catch (error) {
          console.error("Failed to create session:", error);
          throw error;
        }
      },

      removeSession: (sessionId) => {
        const { sessions } = get();

        if (!sessions[sessionId]) {
          console.error("Session not found:", sessionId);
          return;
        }

        // Remove from session ID mapper

        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [sessionId]: removedSession, ...restSessions } = state.sessions;
          const newMap = { ...state.changesMap };
          if (newMap[sessionId]) {
            delete newMap[sessionId];
          }
          const newChangesMap = { ...state.changesMap };
          if (newChangesMap[sessionId]) {
            delete newChangesMap[sessionId];
          }

          return {
            sessions: restSessions,
            onlineSessionIds: state.onlineSessionIds.filter((id) => id !== sessionId),
            changesMap: newChangesMap,
          };
        });
      },

      resetSession: (sessionId) => {
        const { sessions } = get();
        const session = sessions[sessionId];

        if (!session) {
          console.error("Session not found:", sessionId);
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
          updatedAt: now,
        };

        get().setSession(sessionId, emptySession);
      },

      setSessions: (sessions) => {
        //const { sessionIdMap } = get();
        // Clear existing data and set new sessions keyed by real ID
        const newSessions: Record<string, PrismaSession> = {};
        //const newIdMap: Record<string, string> = {};

        sessions.forEach((session) => {
          //const obfuscatedId = getUniqueObfuscatedId(sessionIdMap);
          // Ensure obfuscated mapping exists
          //newIdMap[obfuscatedId] = session.id;
          newSessions[session.id] = session;
        });

        set({
          sessions: newSessions,
          //sessionIdMap: newIdMap,
        });
      },

      sessionExists: (sessionId) => {
        const { sessions } = get();
        return Boolean(sessions[sessionId]);
      },

      setChangesMap: (changes) =>
        set((state) => {
          if (typeof changes === "function") {
            // Functional update
            return { changesMap: changes(state.changesMap) };
          }
          // Direct replacement / merge
          return {
            changesMap: {
              ...state.changesMap,
              ...changes,
            },
          };
        }),
    }),
    {
      name: "encrypted-chat-session-store-v2", // Changed name for clean migration
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({
        //sessionIdMap: state.sessionIdMap,
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
  return useEncryptedSessionStore((state) => state.hasHydrated);
};
