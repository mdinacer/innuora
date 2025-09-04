import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import { PersistedStoreBaseProps } from "@/stores/persisted-store-base";
import { ChatMessage } from "@/types/flow-chat-messages.types";

interface MessagesStoreState extends PersistedStoreBaseProps {
  sessionMessages: Record<string, ChatMessage[]>;

  // Session-level
  createSession: (sessionId: string) => void;
  clearSessionMessages: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;

  // Message-level
  addMessage: (sessionId: string, message: ChatMessage) => void;
  addMessages: (sessionId: string, messages: ChatMessage[]) => void;
  updateMessage: (
    sessionId: string,
    messageId: string,
    updater: Partial<ChatMessage> | ((message: ChatMessage) => ChatMessage)
  ) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;

  // Bulk ops
  replaceMessages: (sessionId: string, messages: ChatMessage[]) => void;
  mapMessages: (sessionId: string, fn: (msg: ChatMessage) => ChatMessage) => void;
}

export const useSessionMessagesStore = create<MessagesStoreState>()(
  devtools(
    persist(
      (set) => ({
        sessionMessages: {},
        hasHydrated: false,
        // Session-level
        createSession: (sessionId) =>
          set(
            (state) => {
              if (state.sessionMessages[sessionId]) {
                // Already exists → no-op
                return state;
              }

              return {
                sessionMessages: {
                  ...state.sessionMessages,
                  [sessionId]: [],
                },
              };
            },
            false,
            "createSession"
          ),

        clearSessionMessages: (sessionId) =>
          set(
            (state) => ({
              sessionMessages: {
                ...state.sessionMessages,
                [sessionId]: [],
              },
            }),
            false,
            "clearSessionMessages"
          ),

        removeSession: (sessionId) =>
          set(
            (state) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { [sessionId]: _, ...rest } = state.sessionMessages;
              return { sessionMessages: rest };
            },
            false,
            "removeSession"
          ),

        // Message-level
        addMessage: (sessionId, message) =>
          set(
            (state) => {
              const msgs = state.sessionMessages[sessionId] ?? [];
              return {
                sessionMessages: {
                  ...state.sessionMessages,
                  [sessionId]: [...msgs, message],
                },
              };
            },
            false,
            "addMessage"
          ),

        addMessages: (sessionId, messages) =>
          set(
            (state) => {
              const msgs = state.sessionMessages[sessionId] ?? [];
              return {
                sessionMessages: {
                  ...state.sessionMessages,
                  [sessionId]: [...msgs, ...messages],
                },
              };
            },
            false,
            "addMessages"
          ),

        updateMessage: (sessionId, messageId, updater) =>
          set(
            (state) => {
              const msgs = state.sessionMessages[sessionId] ?? [];
              return {
                sessionMessages: {
                  ...state.sessionMessages,
                  [sessionId]: msgs.map(
                    (m): ChatMessage =>
                      m.id === messageId
                        ? typeof updater === "function"
                          ? updater(m as ChatMessage) // enforce function returns ChatMessage
                          : ({ ...m, ...updater } as ChatMessage)
                        : m
                  ),
                },
              };
            },
            false,
            "updateMessage"
          ),
        deleteMessage: (sessionId, messageId) =>
          set(
            (state) => {
              const msgs = state.sessionMessages[sessionId] ?? [];
              return {
                sessionMessages: {
                  ...state.sessionMessages,
                  [sessionId]: msgs.filter((m) => m.id !== messageId),
                },
              };
            },
            false,
            "deleteMessage"
          ),

        // Bulk ops
        replaceMessages: (sessionId, messages) =>
          set(
            (state) => ({
              sessionMessages: {
                ...state.sessionMessages,
                [sessionId]: [...messages],
              },
            }),
            false,
            "replaceMessages"
          ),

        mapMessages: (sessionId, fn) =>
          set(
            (state) => {
              const msgs = state.sessionMessages[sessionId] ?? [];
              return {
                sessionMessages: {
                  ...state.sessionMessages,
                  [sessionId]: msgs.map(fn),
                },
              };
            },
            false,
            "mapMessages"
          ),

        setHasHydrated: (state) => {
          set({
            hasHydrated: state,
          });
        },
      }),
      {
        name: "messages-store",
        storage: createJSONStorage(() => localforage),
        partialize: (state) => ({ sessionMessages: state.sessionMessages }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true);
          }
        },
      }
    ),
    { name: "MessagesStore" }
  )
);
