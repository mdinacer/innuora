import { Session as PrismaSession } from "@prisma/client";
import localforage from "localforage";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Session, SessionMeta, SessionMetadataSchema } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { MODELS_CODES } from "@/lib/constants/ai-models";
import { decryptObjectWithKey, encryptObjectWithKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob, EncryptedBlobSchema } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { errorManager } from "@/lib/errors/error-manager";
import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";

const DEFAULT_MODEL_CODE = process.env.NEXT_PUBLIC_DEFAULT_MODEL_CODE ?? MODELS_CODES.M1;

// Generate unique public ID that doesn't already exist
export const getUniqueId = (existingMap: Record<string, string>) => {
  let id;
  do {
    id = nanoid(6);
  } while (existingMap[id]);
  return id;
};

export type SessionChangeState = { sessionId?: string | null; state: "new" | "modified"; updatedAt: Date };

export async function encryptSession(session: Partial<Session>): Promise<PrismaSession> {
  return await errorManager.wrapOperation(
    async () => {
      const contentKey = await getStoredContentKey();

      if (!contentKey) {
        errorManager.handleError(ERROR_CODES.CRYPTO_KEY_RETRIEVAL_FAILED, new Error("No content key found"), {
          operation: "encryptSession",
          sessionId: session.id,
        });
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
        const encryptedData: EncryptedBlob = await encryptObjectWithKey(dataToEncrypt, contentKey!);
        sessionData = {
          ...sessionData,
          encryptedData,
        };
      }

      return sessionData as PrismaSession;
    },
    ERROR_CODES.SESSION_ENCRYPTION_FAILED,
    { operation: "encryptSession", sessionId: session.id }
  );
}

export async function decryptSession(encryptedSession: PrismaSession): Promise<Session> {
  return await errorManager.wrapOperation(
    async () => {
      const contentKey = await getStoredContentKey();

      if (!contentKey) {
        errorManager.handleError(ERROR_CODES.CRYPTO_KEY_RETRIEVAL_FAILED, new Error("No content key found"), {
          operation: "decryptSession",
          sessionId: encryptedSession.id,
        });
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

      const decryptedData = await decryptObjectWithKey<Partial<Session>>(
        encryptedSession.encryptedData as EncryptedBlob,
        contentKey!
      );

      const parsedData = EncryptedBlobSchema.safeParse(encryptedSession.encryptedData);

      session = { ...session, ...decryptedData } as Session;

      if (parsedData.success) {
        const { data } = parsedData;
        const decryptedData = await decryptObjectWithKey<Partial<Session>>(data, contentKey!);

        session = { ...session, ...decryptedData } as Session;
      }

      return session;
    },
    ERROR_CODES.SESSION_DECRYPTION_FAILED,
    { operation: "decryptSession", sessionId: encryptedSession.id }
  );
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
  publicIdMap: Record<string, string>; // publicId => sessionId
  getSession: (sessionId: string) => Promise<Session | null>;
  getSessionPublicId: (sessionId: string) => string | undefined;
  addSession: (session: PrismaSession) => void;
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
}

const initialState: Pick<
  EncryptedChatSessionStoreState,
  "sessions" | "hasHydrated" | "onlineSessionIds" | "changesMap" | "publicIdMap"
> = {
  sessions: {},
  hasHydrated: false,
  changesMap: {},
  onlineSessionIds: [],
  publicIdMap: {},
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
          // Log error but return null for graceful handling
          errorManager.handleError(ERROR_CODES.SESSION_DECRYPTION_FAILED, error, {
            operation: "getSession",
            sessionId,
          });
          throw new Error("Unreachable");
        }
      },

      getSessionPublicId: (sessionId) => {
        const { publicIdMap } = get();
        return Object.keys(publicIdMap).find((k) => publicIdMap[k] === sessionId);
      },
      addSession: (session) => {
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
        }));
      },
      setSession: (publicId, session) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [session.id]: session,
          },
          publicIdMap: {
            ...state.publicIdMap,
            [publicId]: session.id,
          },
        }));
      },

      updateSession: async (sessionId, session) => {
        const { sessions } = get();
        if (!sessions[sessionId]) {
          errorManager.handleError(ERROR_CODES.SESSION_NOT_FOUND, new Error("Session not found"), {
            operation: "updateSession",
            sessionId,
          });
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
              [sessionId]: encryptedSession,
            },
          }));
        } catch (error) {
          errorManager.handleError(ERROR_CODES.SESSION_UPDATE_FAILED, error, { operation: "updateSession", sessionId });
        }
      },

      createSession: async (data = {}) => {
        const { sessions, publicIdMap } = get();

        // Generate real session ID
        const sessionId = data?.id ?? crypto.randomUUID();
        const publicId = getUniqueId(publicIdMap);

        // Check if session ID already exists
        if (sessions[sessionId]) {
          errorManager.handleError(ERROR_CODES.SESSION_CREATE_FAILED, new Error("Session already exists"), {
            operation: "createSession",
            sessionId,
          });
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
            publicIdMap: {
              ...state.publicIdMap,
              [publicId]: sessionId,
            },
          }));

          return sessionId;
        } catch (error) {
          errorManager.handleError(ERROR_CODES.SESSION_CREATE_FAILED, error, { operation: "createSession", sessionId });
          throw new Error("Unreachable");
        }
      },

      removeSession: (sessionId) => {
        const { sessions, getSessionPublicId } = get();

        if (!sessions[sessionId]) {
          console.warn("Attempted to remove non-existent session:", sessionId);
          return;
        }

        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [sessionId]: _, ...restSessions } = state.sessions;

          // Clean up publicIdMap
          const publicId = getSessionPublicId(sessionId);
          const newPublicIdMap = { ...state.publicIdMap };
          if (publicId) {
            delete newPublicIdMap[publicId];
          }

          // Clean up changesMap
          const newChangesMap = { ...state.changesMap };
          delete newChangesMap[sessionId];

          return {
            sessions: restSessions,
            publicIdMap: newPublicIdMap,
            changesMap: newChangesMap,
            onlineSessionIds: state.onlineSessionIds.filter((id) => id !== sessionId),
          };
        });
      },

      resetSession: (sessionId) => {
        const { sessions } = get();
        const session = sessions[sessionId];

        if (!session) {
          console.warn("Attempted to reset non-existent session:", sessionId);
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
        // Build fresh state, do not reuse old maps
        const newSessions: Record<string, PrismaSession> = {};
        const newPublicIdMap: Record<string, string> = {};

        sessions.forEach((session) => {
          const publicId = getUniqueId(newPublicIdMap);
          newPublicIdMap[publicId] = session.id;
          newSessions[session.id] = session;
        });

        set({
          sessions: newSessions,
          publicIdMap: newPublicIdMap,
          onlineSessionIds: [], // optional: clear stale online IDs
          changesMap: {}, // optional: clear changes if you want clean reset
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
        publicIdMap: state.publicIdMap,
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
