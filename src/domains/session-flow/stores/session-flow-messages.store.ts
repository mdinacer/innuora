// =======================
// SESSION FLOW MESSAGES STORE
// =======================

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { ChatMessage } from "@/types/flow-chat-messages.types";
import { SessionFlowError } from "../types/session-flow-state.types";
import { createSessionFlowError } from "../utils/session-flow-validation";

interface SessionFlowMessagesStoreState {
  sessionMessages: Record<string, ChatMessage[]>;
  errors: Record<string, SessionFlowError>;

  // Getters
  getMessages: (sessionId: string) => ChatMessage[] | undefined;
  getMessageById: (sessionId: string, messageId: string) => ChatMessage | undefined;
  getMessageByStepId: (sessionId: string, stepId: string) => ChatMessage | undefined;
  messageExists: (sessionId: string, messageId: string) => boolean;
  messageExistsByStepId: (sessionId: string, stepId: string) => boolean;
  getLastMessage: (sessionId: string) => ChatMessage | undefined;
  getMessageCount: (sessionId: string) => number;

  // Session Management
  createSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  clearSession: (sessionId: string) => void;

  // Message Management
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (
    sessionId: string,
    messageId: string,
    updater: Partial<ChatMessage> | ((message: ChatMessage) => ChatMessage)
  ) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  deleteMessageByStepId: (sessionId: string, stepId: string) => void;

  // Bulk Operations
  setMessages: (sessionId: string, messages: ChatMessage[]) => void;
  clearMessages: (sessionId: string) => void;

  // Error Management
  setError: (sessionId: string, error: SessionFlowError) => void;
  clearError: (sessionId: string) => void;
  getError: (sessionId: string) => SessionFlowError | undefined;
}

export const useSessionFlowMessagesStore = create<SessionFlowMessagesStoreState>()(
  devtools(
    (set, get) => ({
      sessionMessages: {},
      errors: {},

      // Getters
      getMessages: (sessionId) => get().sessionMessages[sessionId],

      getMessageById: (sessionId, messageId) => {
        const messages = get().sessionMessages[sessionId];
        return messages?.find((msg) => msg.id === messageId);
      },

      getMessageByStepId: (sessionId, stepId) => {
        const messages = get().sessionMessages[sessionId];
        return messages?.find((msg) => msg.flowStepId === stepId);
      },

      messageExists: (sessionId, messageId) => {
        const messages = get().sessionMessages[sessionId];
        return messages?.some((msg) => msg.id === messageId) ?? false;
      },

      messageExistsByStepId: (sessionId, stepId) => {
        const messages = get().sessionMessages[sessionId];
        return messages?.some((msg) => msg.flowStepId === stepId) ?? false;
      },

      getLastMessage: (sessionId) => {
        const messages = get().sessionMessages[sessionId];
        return messages?.[messages.length - 1];
      },

      getMessageCount: (sessionId) => {
        const messages = get().sessionMessages[sessionId];
        return messages?.length ?? 0;
      },

      // Session Management
      createSession: (sessionId) => {
        set(
          (state) => {
            if (state.sessionMessages[sessionId]) {
              console.warn(`[SessionFlowMessages] Session ${sessionId} already exists`);
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
        );
      },

      removeSession: (sessionId) => {
        set(
          (state) => {
            const { [sessionId]: _, ...restMessages } = state.sessionMessages;
            const { [sessionId]: __, ...restErrors } = state.errors;
            return {
              sessionMessages: restMessages,
              errors: restErrors,
            };
          },
          false,
          "removeSession"
        );
      },

      clearSession: (sessionId) => {
        set(
          (state) => ({
            sessionMessages: {
              ...state.sessionMessages,
              [sessionId]: [],
            },
          }),
          false,
          "clearSession"
        );
      },

      // Message Management
      addMessage: (sessionId, message) => {
        set(
          (state) => {
            const currentMessages = state.sessionMessages[sessionId];
            if (!currentMessages) {
              console.warn(`[SessionFlowMessages] Cannot add message to non-existent session: ${sessionId}`);
              return state;
            }

            // Check for duplicate IDs
            if (currentMessages.some((msg) => msg.id === message.id)) {
              console.warn(`[SessionFlowMessages] Message with ID ${message.id} already exists`);
              return state;
            }

            // Check for duplicate step IDs (if message has one)
            if (message.flowStepId && currentMessages.some((msg) => msg.flowStepId === message.flowStepId)) {
              console.warn(`[SessionFlowMessages] Message with step ID ${message.flowStepId} already exists`);
              return state;
            }

            return {
              sessionMessages: {
                ...state.sessionMessages,
                [sessionId]: [...currentMessages, message],
              },
            };
          },
          false,
          "addMessage"
        );
      },

      updateMessage: (sessionId, messageId, updater) => {
        set(
          (state) => {
            const currentMessages = state.sessionMessages[sessionId];
            if (!currentMessages) {
              console.warn(`[SessionFlowMessages] Cannot update message in non-existent session: ${sessionId}`);
              return state;
            }

            const messageIndex = currentMessages.findIndex((msg) => msg.id === messageId);
            if (messageIndex === -1) {
              console.warn(`[SessionFlowMessages] Message with ID ${messageId} not found`);
              return state;
            }

            try {
              const currentMessage = currentMessages[messageIndex];
              const updatedMessage =
                typeof updater === "function" ? updater(currentMessage) : { ...currentMessage, ...updater };

              const newMessages = [...currentMessages];
              newMessages[messageIndex] = updatedMessage as ChatMessage;

              return {
                sessionMessages: {
                  ...state.sessionMessages,
                  [sessionId]: newMessages,
                },
              };
            } catch (error) {
              console.error(`[SessionFlowMessages] Error updating message ${messageId}:`, error);
              const sessionError = createSessionFlowError(
                "VALIDATION_ERROR",
                error instanceof Error ? error.message : "Unknown error during message update",
                undefined,
                { sessionId, messageId }
              );

              return {
                ...state,
                errors: {
                  ...state.errors,
                  [sessionId]: sessionError,
                },
              };
            }
          },
          false,
          "updateMessage"
        );
      },

      deleteMessage: (sessionId, messageId) => {
        set(
          (state) => {
            const currentMessages = state.sessionMessages[sessionId];
            if (!currentMessages) {
              console.warn(`[SessionFlowMessages] Cannot delete message from non-existent session: ${sessionId}`);
              return state;
            }

            const filteredMessages = currentMessages.filter((msg) => msg.id !== messageId);
            if (filteredMessages.length === currentMessages.length) {
              console.warn(`[SessionFlowMessages] Message with ID ${messageId} not found for deletion`);
              return state;
            }

            return {
              sessionMessages: {
                ...state.sessionMessages,
                [sessionId]: filteredMessages,
              },
            };
          },
          false,
          "deleteMessage"
        );
      },

      deleteMessageByStepId: (sessionId, stepId) => {
        set(
          (state) => {
            const currentMessages = state.sessionMessages[sessionId];
            if (!currentMessages) {
              console.warn(`[SessionFlowMessages] Cannot delete message from non-existent session: ${sessionId}`);
              return state;
            }

            const filteredMessages = currentMessages.filter((msg) => msg.flowStepId !== stepId);
            if (filteredMessages.length === currentMessages.length) {
              console.warn(`[SessionFlowMessages] Message with step ID ${stepId} not found for deletion`);
              return state;
            }

            return {
              sessionMessages: {
                ...state.sessionMessages,
                [sessionId]: filteredMessages,
              },
            };
          },
          false,
          "deleteMessageByStepId"
        );
      },

      // Bulk Operations
      setMessages: (sessionId, messages) => {
        set(
          (state) => ({
            sessionMessages: {
              ...state.sessionMessages,
              [sessionId]: messages,
            },
          }),
          false,
          "setMessages"
        );
      },

      clearMessages: (sessionId) => {
        get().setMessages(sessionId, []);
      },

      // Error Management
      setError: (sessionId, error) => {
        set(
          (state) => ({
            errors: {
              ...state.errors,
              [sessionId]: error,
            },
          }),
          false,
          "setError"
        );
      },

      clearError: (sessionId) => {
        set(
          (state) => {
            const { [sessionId]: _, ...restErrors } = state.errors;
            return { errors: restErrors };
          },
          false,
          "clearError"
        );
      },

      getError: (sessionId) => get().errors[sessionId],
    }),
    { name: "SessionFlowMessagesStore" }
  )
);
