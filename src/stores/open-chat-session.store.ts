import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { MODELS_CODES } from "@/lib/constants/ai-models";
import { StateAnalysis } from "@/lib/zod/state-analysis.schema";
import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { Session } from "@/types/open-chat-session.types";

const DEFAULT_MODEL_CODE = MODELS_CODES.M1;

interface OpenChatSessionStoreState extends PersistedStoreBaseProps {
  sessions: Record<string, Session>;
  getSession: (id: string) => Session | undefined;
  getSessionField: <K extends keyof Session>(id: string, key: K) => Session[K] | undefined;
  createSession: (id: string, data?: Partial<Session>) => void;
  updateSession: (id: string, update: Partial<Session> | ((session: Session) => Session)) => void;
  resetSession: (id: string) => void;

  addMessage: (id: string, message: OpenChatMessage) => void;
  addAnalysis: (id: string, analysis: StateAnalysis) => void;
  addTokenUsage: (id: string, tokenUsage: ModelTokenUsage) => void;

  updateTotalCost: (id: string, cost: number | ((cost: number) => number)) => void;
}

const initialState: Pick<OpenChatSessionStoreState, "sessions" | "hasHydrated"> = {
  sessions: {},
  hasHydrated: false,
};

export const useOpenChatSessionStore = create<OpenChatSessionStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      getSession: (id) => get().sessions[id],
      //   getSession: (id) => {
      //     const existing = get().sessions[id];
      //     if (existing) return existing;

      //     // auto-create if missing
      //     const now = new Date();
      //     const newSession: Session = {
      //       id,
      //       title: "Untitled Session",
      //       subtitle: "",
      //       createdAt: now,
      //       updatedAt: now,
      //       messages: [],
      //       summary: null,
      //       analysis: [],
      //       meta: { messageCount: 0, tokenCount: 0, costUSD: 0 },
      //       modelCode: DEFAULT_MODEL_CODE,
      //     };

      //     set((state) => ({
      //       sessions: {
      //         ...state.sessions,
      //         [id]: newSession,
      //       },
      //     }));

      //     return newSession;
      //   },

      getSessionField: (id, key) => {
        const session = get().sessions[id];
        return session ? session[key] : undefined;
      },

      createSession: (id, data = {}) => {
        console.log("Creating session", id, data);
        const now = new Date();
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              id,
              title: data.title ?? "Untitled Session",
              subtitle: data.subtitle ?? "",
              createdAt: data.createdAt ?? now,
              updatedAt: data.updatedAt ?? now,
              messages: data.messages ?? [],
              summary: data.summary ?? null,
              analysis: data.analysis ?? [],
              meta: data.meta ?? { messageCount: 0, tokenCount: 0, costUSD: 0, tokenUsage: [] },
              modelCode: data.modelCode ?? DEFAULT_MODEL_CODE,
            },
          },
        }));
      },

      updateSession: (id, update) => {
        set((state) => {
          const existing = state.sessions[id];
          if (!existing) return state;

          const newSession =
            typeof update === "function" ? update(existing) : { ...existing, ...update, updatedAt: new Date() };

          return {
            sessions: {
              ...state.sessions,
              [id]: newSession,
            },
          };
        });
      },

      resetSession: (id) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _, ...rest } = state.sessions;
          return { sessions: rest };
        });
      },

      addMessage: (id, message) => {
        set((state) => {
          const session = state.sessions[id];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...session,
                messages: [...session.messages, message],
                updatedAt: new Date(),
                meta: {
                  ...session.meta,
                  messageCount: session.meta.messageCount + 1,
                },
              },
            },
          };
        });
      },

      addAnalysis: (id, analysis) => {
        set((state) => {
          const session = state.sessions[id];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...session,
                analysis: [...session.analysis, analysis],
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      addTokenUsage: (id, tokenUsage) => {
        set((state) => {
          const session = state.sessions[id];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...session,
                meta: {
                  ...session.meta,
                  tokenCount: session.meta.tokenCount + (tokenUsage.usage?.total_tokens || 0),
                  costUSD: session.meta.costUSD + tokenUsage.costUSD,
                },
              },
            },
          };
        });
      },

      updateTotalCost: (id, cost) => {
        set((state) => {
          const session = state.sessions[id];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [id]: {
                ...session,
                meta: {
                  ...session.meta,
                  costUSD: typeof cost === "function" ? cost(session.meta.costUSD) : cost,
                },
              },
            },
          };
        });
      },
    }),
    {
      name: "open-chat-session-store",
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({ sessions: state.sessions }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.setHasHydrated(true);
      },
    }
  )
);
