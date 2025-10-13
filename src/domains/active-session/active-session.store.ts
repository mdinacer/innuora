import { create } from "zustand";

import { resetSessionData } from "@/domains/active-session/active-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { generateMessageId } from "@/domains/session-flow/utils/generate-id";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { logger } from "@/lib/logging/unified-logger";
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
  appendMessage: (content: string, role: "user" | "assistant", creditsUsed?: number) => string | null;
  addAnalysis: (analysis: TherapeuticAnalysis, messageId: string) => void;
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
      logger.logWarning("Attempting to set invalid session", {
        operation: "active_session_store_set_invalid_session",
        metadata: { hasSession: !!session, sessionId: session?.id },
      });
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
    const current = get().session;
    if (!current) return null;

    // Update active duration when user sends a message
    if (role === "user") {
      const now = new Date();
      const lastActive = new Date(current.metadata.lastActiveAt);
      const timeSinceLastActive = lastActive ? now.getTime() - lastActive.getTime() : 0;

      // Only count as active time if less than 5 minutes gap (300,000ms)
      const additionalTime = timeSinceLastActive < 300000 ? timeSinceLastActive : 0;

      set({
        session: {
          ...current,
          metadata: {
            ...current.metadata,
            activeDurationMs: current.metadata.activeDurationMs + additionalTime,
            lastActiveAt: now,
          },
        },
      });
    }

    //const messageId = generateMessageId(`${role}-message-${current.id}`);
    const messageId = generateMessageId();

    get().addMessage({
      id: messageId,
      role: role,
      content: content,
      timestamp: Date.now(),
      creditsUsed: creditsUsed,
    });

    return messageId;
  },

  // NOTE: addAnalysis is now a no-op - analysis is stored server-side only
  // Analysis is automatically saved in handleUserInput via updateSessionContext()
  addAnalysis: (_analysis, _messageId) => {
    // No-op: Analysis is stored server-side only for security
    // Server action automatically saves via updateSessionContext()
  },

  addTokenUsage: (tokenUsage) => {
    const current = get().session;
    if (!current) return;

    const inputTokensDelta = tokenUsage.usage?.prompt_tokens || 0;
    const outputTokensDelta = tokenUsage.usage?.completion_tokens || 0;
    const totalTokensDelta = tokenUsage.usage?.total_tokens || 0;

    // NOTE: Server analytics are now tracked in AiOperationLog table (server-side only)
    // Client-side only tracks basic token usage metadata for UI display

    set({
      session: {
        ...current,
        metadata: {
          ...current.metadata,
          tokenUsage: [...current.metadata.tokenUsage, tokenUsage],
          tokenCount: current.metadata.tokenCount + totalTokensDelta,
          inputTokens: current.metadata.inputTokens + inputTokensDelta,
          outputTokens: current.metadata.outputTokens + outputTokensDelta,
          costUSD: current.metadata.costUSD + tokenUsage.costUSD,
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
