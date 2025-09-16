import { create } from "zustand";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";
import { generateMessageId } from "@/lib/chat/flow/generate-id";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

function resetSessionData(session: Session): Session {
  return {
    id: session.id,
    userId: session.userId,
    title: session.title,
    subtitle: session.subtitle,
    messages: [],
    memoryStore: null,
    continuitySummary: null,
    aggregatedAnalysis: null,
    analysisSnapshots: [],
    modelCode: session.modelCode,
    autoUpdateTitle: session.autoUpdateTitle,
    persistOnCloud: session.persistOnCloud,
    metadata: {
      tokenUsage: [],
      messageCount: 0,
      tokenCount: 0,
      costUSD: 0,
    },
    createdAt: session.createdAt,
    updatedAt: new Date(), // Update timestamp when resetting
  };
}

interface ActiveSessionStoreState {
  currentSession: Session | null;
  loadSession: (sessionId: string) => Promise<boolean>; // Now uses real session ID
  getSessionField: <K extends keyof Session>(key: K) => Session[K] | undefined;
  updateSession: (update: Partial<Session> | ((session: Session) => Session)) => void;
  resetSession: () => void;
  clearCurrentSession: () => void;
  setCurrentSession: (session: Session) => void;

  addMessage: (message: OpenChatMessage) => void;
  appendMessage: (content: string, role: "user" | "assistant") => void;

  addAnalysis: (analysis: StateAnalysis) => void;
  addTokenUsage: (tokenUsage: ModelTokenUsage) => void;
  updateTotalCost: (cost: number | ((cost: number) => number)) => void;
}

const initialStoreState: Pick<ActiveSessionStoreState, "currentSession"> = {
  currentSession: null,
};

export const useActiveSessionStore = create<ActiveSessionStoreState>()((set, get) => ({
  ...initialStoreState,

  loadSession: async (sessionId) => {
    try {
      const encryptedStore = useEncryptedSessionStore.getState();

      // Check if encrypted store has hydrated
      if (!encryptedStore.hasHydrated) {
        console.warn("Encrypted store not yet hydrated, cannot load session");
        return false;
      }

      const session = await encryptedStore.getSession(sessionId);

      if (!session) {
        console.error("Session not found:", sessionId);
        return false;
      }

      set({
        currentSession: session,
      });

      return true;
    } catch (error) {
      console.error("Failed to load session:", error);
      return false;
    }
  },

  getSessionField: (key) => get().currentSession?.[key],

  updateSession: (update) => {
    const current = get().currentSession;
    if (!current) return;

    const newSession =
      typeof update === "function" ? update(current) : { ...current, ...update, updatedAt: new Date() };

    set({ currentSession: newSession });
  },

  resetSession: () => {
    const current = get().currentSession;
    if (!current) return;
    const newSession = resetSessionData(current);
    set({ currentSession: newSession });
  },

  clearCurrentSession: () => set({ currentSession: null }),

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  appendMessage: (content, role) => {
    if (!content.trim()) return;
    const current = get().currentSession;
    if (!current) return;

    get().addMessage({
      id: generateMessageId(`${role}-message-${current.id}`),
      role: role,
      content: content,
      timestamp: Date.now(),
    });
  },

  addMessage: (message) => {
    const current = get().currentSession;
    if (!current) return;

    set({
      currentSession: {
        ...current,
        messages: [...current.messages, message],
        updatedAt: new Date(),
        metadata: {
          ...current.metadata,
          messageCount: current.metadata.messageCount + 1,
        },
      },
    });
  },

  addAnalysis: (analysis) => {
    const current = get().currentSession;
    if (!current) return;

    set({
      currentSession: {
        ...current,
        analysisSnapshots: [...current.analysisSnapshots, analysis],
        updatedAt: new Date(),
      },
    });
  },

  addTokenUsage: (tokenUsage) => {
    const current = get().currentSession;
    if (!current) return;

    const newTokenCount = current.metadata.tokenCount + (tokenUsage.usage?.total_tokens || 0);
    const newCostUSD = current.metadata.costUSD + tokenUsage.costUSD;

    set({
      currentSession: {
        ...current,
        metadata: {
          ...current.metadata,
          tokenUsage: [...current.metadata.tokenUsage, tokenUsage],
          tokenCount: newTokenCount,
          costUSD: newCostUSD,
        },
        updatedAt: new Date(),
      },
    });
  },

  updateTotalCost: (cost) => {
    const current = get().currentSession;
    if (!current) return;

    const newCost = typeof cost === "function" ? cost(current.metadata.costUSD) : cost;

    set({
      currentSession: {
        ...current,
        metadata: {
          ...current.metadata,
          costUSD: newCost,
        },
        updatedAt: new Date(),
      },
    });
  },
}));
