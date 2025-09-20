import { create } from "zustand";

import { resetSessionData } from "@/domains/active-session/active-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { generateMessageId } from "@/domains/session-flow/utils/generate-id";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface ActiveSessionStoreState {
  session: Session | null;
  isLoading: boolean;
  isDirty: boolean; // Has unsaved changes

  setSession: (session: Session) => void;
  updateSession: (update: Partial<Session> | ((session: Session) => Session)) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  markDirty: () => void;
  markClean: () => void;

  // Session actions
  addMessage: (message: OpenChatMessage) => void;
  appendMessage: (content: string, role: "user" | "assistant", creditsUsed?: number) => void;
  addAnalysis: (analysis: TherapeuticAnalysis) => void;
  addTokenUsage: (tokenUsage: ModelTokenUsage) => void;
  updateTotalCost: (cost: number | ((cost: number) => number)) => void;
  addCreditsUsed: (credits: number) => void;
  resetSession: () => void;
}

export const useActiveSessionStore = create<ActiveSessionStoreState>((set, get) => ({
  session: null,
  isLoading: false,
  isDirty: false,

  setSession: (session) => {
    if (!session?.id) {
      console.warn("Attempting to set invalid session");
      return;
    }
    set({ session, isDirty: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

  updateSession: (update) => {
    const current = get().session;
    if (!current) return;

    const newSession =
      typeof update === "function" ? update(current) : { ...current, ...update, updatedAt: new Date() };

    set({ session: newSession, isDirty: true });
  },

  clearSession: () => set({ session: null, isDirty: false, isLoading: false }),

  addMessage: (message) => {
    const current = get().session;
    if (!current) return;

    set({
      session: {
        ...current,
        messages: [...current.messages, message],
        updatedAt: new Date(),
        metadata: {
          ...current.metadata,
          messageCount: current.metadata.messageCount + 1,
        },
      },
      isDirty: true,
    });
  },

  appendMessage: (content, role, creditsUsed) => {
    if (!content.trim()) return;
    const current = get().session;
    if (!current) return;

    get().addMessage({
      id: generateMessageId(`${role}-message-${current.id}`),
      role: role,
      content: content,
      timestamp: Date.now(),
      creditsUsed: creditsUsed,
    });
  },

  addAnalysis: (analysis) => {
    const current = get().session;
    if (!current) return;

    set({
      session: {
        ...current,
        analysisSnapshots: [...current.analysisSnapshots, analysis],
        updatedAt: new Date(),
      },
      isDirty: true,
    });
  },

  addTokenUsage: (tokenUsage) => {
    const current = get().session;
    if (!current) return;

    const newTokenCount = current.metadata.tokenCount + (tokenUsage.usage?.total_tokens || 0);
    const newCostUSD = current.metadata.costUSD + tokenUsage.costUSD;

    set({
      session: {
        ...current,
        metadata: {
          ...current.metadata,
          tokenUsage: [...current.metadata.tokenUsage, tokenUsage],
          tokenCount: newTokenCount,
          costUSD: newCostUSD,
        },
        updatedAt: new Date(),
      },
      isDirty: true,
    });
  },

  updateTotalCost: (cost) => {
    const current = get().session;
    if (!current) return;

    const newCost = typeof cost === "function" ? cost(current.metadata.costUSD) : cost;

    set({
      session: {
        ...current,
        metadata: {
          ...current.metadata,
          costUSD: newCost,
        },
        updatedAt: new Date(),
      },
      isDirty: true,
    });
  },

  addCreditsUsed: (credits) => {
    const current = get().session;
    if (!current) return;

    set({
      session: {
        ...current,
        metadata: {
          ...current.metadata,
          creditsUsed: (current.metadata.creditsUsed || 0) + credits,
        },
        updatedAt: new Date(),
      },
      isDirty: true,
    });
  },

  resetSession: () => {
    const current = get().session;
    if (!current) return;
    const newSession = resetSessionData(current);
    set({ session: newSession, isDirty: true });
  },
}));
