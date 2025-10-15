import { create } from "zustand";

import { resetSessionData } from "@/domains/active-session/active-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { generateMessageId } from "@/domains/session-flow/utils/generate-id";
import { logger } from "@/lib/logging/unified-logger";
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
      const lastActive = current.metadata.lastActiveAt ? new Date(current.metadata.lastActiveAt) : now;
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
