import { create } from "zustand";

import { useSessionStore } from "@/domains/guidance-flow/stores/sessions-store";
import { ConversationMessage } from "@/domains/guidance-flow/types/chat-message";
import { ConversationSession } from "@/domains/guidance-flow/types/session-runtime";
import { decryptSessionData, encryptSessionData } from "@/domains/guidance-flow/utils/encryption-utils";

type SessionSyncState = "modified" | "unmodified" | "synced" | null;

interface ActiveSessionStoreState {
  session: ConversationSession | null;
  publicId: string | null;
  state: SessionSyncState;
  isLoading: boolean;
  error: string | null;
  syncSession: () => Promise<void>;
  setSessionState: (state: Exclude<SessionSyncState, null>) => void;
  openSession: (publicId: string) => void;
  closeSession: () => void;
  appendMessage: (message: ConversationMessage) => void;
  updateMessage: (
    id: string,
    message: Partial<ConversationMessage> | ((msg: ConversationMessage) => ConversationMessage)
  ) => void;
  removeMessage: (index: number) => void;
  clearMessages: () => void;
}

const initialState: Pick<ActiveSessionStoreState, "session" | "publicId" | "state" | "isLoading" | "error"> = {
  session: null,
  publicId: null,
  state: null,
  isLoading: false,
  error: null,
};

export const useActiveSessionStore = create<ActiveSessionStoreState>()((set, get) => ({
  // ✅ spread the real initial values so TypeScript sees the required props
  ...initialState,

  syncSession: async () => {
    const session = get().session;
    if (!session) return;
    const sessionStore = useSessionStore.getState();
    const { id: sessionId, messages } = session;

    const now = new Date();

    // Fast path: no messages → clear encrypted data
    if (messages.length === 0) {
      sessionStore.updateSession(sessionId, {
        messages: null,
        updatedAt: now,
      });
      return;
    }

    // Encrypt only messages (no need to recreate full object)
    const encryptedData = await encryptSessionData({ messages });

    sessionStore.updateSession(sessionId, {
      messages: encryptedData,
      updatedAt: now,
    });
  },

  /** Load or replace the active session */
  openSession: async (publicId) => {
    set({ isLoading: true, error: null, session: null });

    try {
      const encryptedStore = useSessionStore.getState();
      const encrypted = encryptedStore.getSessionByPublicId(publicId);
      if (!encrypted) throw new Error("Session not found");

      const decrypted = encrypted.messages ? await decryptSessionData(encrypted.messages) : null;

      set({
        publicId,
        session: {
          id: encrypted.id,
          userId: encrypted.userId,
          title: encrypted.title,
          subtitle: encrypted.subtitle ?? undefined,
          autoUpdateTitle: encrypted.autoUpdateTitle,
          persistOnCloud: encrypted.persistOnCloud,
          metadata: encrypted.metadata ?? {
            messageCount: 0,
            creditsUsed: 0,
            activeDurationMs: 0,
            lastActiveAt: new Date(),
          },
          messages: decrypted?.messages ?? [],
          createdAt: encrypted.createdAt,
          updatedAt: encrypted.updatedAt,
        },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        publicId: null,
        session: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load session",
      });
    }
  },

  /** Reset the entire active session */
  closeSession: async () => {
    get().syncSession().catch(console.error);
    set({ ...initialState });
  },

  /** Manually set session sync state */
  setSessionState: (state) => set({ state }),

  /** Append a new message and update metadata */
  appendMessage: (message) => {
    const current = get();
    const session = current.session;
    if (!session) return;
    const newMessages = [...session.messages, message];
    const newMetadata = {
      ...session.metadata,
      messageCount: (session.metadata?.messageCount ?? 0) + 1,
      lastActiveAt: new Date(),
    };
    set(() => ({
      session: { ...session, messages: newMessages, metadata: newMetadata },
      state: "modified",
    }));
    get().syncSession().catch(console.error);
  },

  /** Update an existing message by ID (partial or functional) */
  updateMessage: (id, updater) => {
    const current = get();
    const session = current.session;
    if (!session) return;
    const newMessages = session.messages.map((msg) =>
      msg.id === id
        ? typeof updater === "function"
          ? (updater as (m: ConversationMessage) => ConversationMessage)(msg)
          : { ...msg, ...updater }
        : msg
    );
    set(() => ({
      session: { ...session, messages: newMessages },
      state: "modified",
    }));
    get().syncSession().catch(console.error);
  },

  /** Remove a message by index */
  removeMessage: (index) => {
    const current = get();
    const session = current.session;
    if (!session) return;
    const newMessages = session.messages.filter((_, i) => i !== index);
    const newMetadata = {
      ...session.metadata,
      messageCount: (session.metadata?.messageCount ?? 0) - 1,
    };
    set(() => ({
      session: { ...session, messages: newMessages, metadata: newMetadata },
      state: "modified",
    }));
    get().syncSession().catch(console.error);
  },

  /** Clear all messages but preserve session identity */
  clearMessages: () => {
    set((state) => ({
      session: state.session ? { ...state.session, messages: [] } : null,
      state: "modified",
    }));
    get().syncSession().catch(console.error);
  },
}));
