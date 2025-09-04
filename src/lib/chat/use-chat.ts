import { useCallback } from "react";

import { useSessionMessagesStore } from "@/stores/messages.store";
import { ChatMessage } from "@/types/flow-chat-messages.types";

export default function useChatEngine({ sessionId }: { sessionId: string }) {
  const messages = useSessionMessagesStore((state) => state.sessionMessages[sessionId]) as ChatMessage[] | undefined;
  const hasHydrated = useSessionMessagesStore((state) => state.hasHydrated);

  const addMessage = useCallback(
    (message: ChatMessage) => {
      useSessionMessagesStore.getState().addMessage(sessionId, message);
    },
    [sessionId]
  );

  const updateMessage = useCallback(
    (messageId: string, updater: Partial<ChatMessage> | ((message: ChatMessage) => ChatMessage)) => {
      useSessionMessagesStore.getState().updateMessage(sessionId, messageId, updater);
    },
    [sessionId]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      useSessionMessagesStore.getState().deleteMessage(sessionId, messageId);
    },
    [sessionId]
  );
  const clearMessages = useCallback(() => {
    useSessionMessagesStore.getState().clearSessionMessages(sessionId);
  }, [sessionId]);
  const removeSession = useCallback(() => {
    useSessionMessagesStore.getState().removeSession(sessionId);
  }, [sessionId]);

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  const findMessageById = useCallback(
    (messageId: string): ChatMessage | undefined => {
      const currentMessages = useSessionMessagesStore.getState().sessionMessages[sessionId];
      return currentMessages?.find((msg) => msg.id === messageId);
    },
    [sessionId]
  );

  const findMessageByStepId = useCallback(
    (stepId: string): ChatMessage | undefined => {
      const currentMessages = useSessionMessagesStore.getState().sessionMessages[sessionId];
      return currentMessages?.find((msg) => msg.flowStepId === stepId);
    },
    [sessionId]
  );

  const messageExistsById = useCallback(
    (messageId: string): boolean => {
      const currentMessages = useSessionMessagesStore.getState().sessionMessages[sessionId];
      return currentMessages?.some((msg) => msg.id === messageId) ?? false;
    },
    [sessionId]
  );

  const messageExistsByStepId = useCallback(
    (stepId: string): boolean => {
      const currentMessages = useSessionMessagesStore.getState().sessionMessages[sessionId];
      return currentMessages?.some((msg) => msg.flowStepId === stepId) ?? false;
    },
    [sessionId]
  );

  // ===========================
  // CORE CRUD OPERATIONS
  // ===========================

  const addChatMessage = useCallback(
    (message: ChatMessage): boolean => {
      if (!messages) {
        console.warn("Cannot add message: session not available");
        return false;
      }

      // Check for duplicates
      if (messageExistsById(message.id)) {
        console.warn(`Message with id "${message.id}" already exists`);
        return false;
      }

      if (message.flowStepId && messageExistsByStepId(message.flowStepId)) {
        console.warn(`Message with flowStepId "${message.flowStepId}" already exists`);
        return false;
      }

      addMessage(message);

      return true;
    },
    [messages, messageExistsById, messageExistsByStepId, addMessage]
  );

  const updateChatMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>): boolean => {
      if (!messages) {
        console.warn("Cannot update message: session not available");
        return false;
      }

      if (!messageExistsById(messageId)) {
        console.warn(`Message with id "${messageId}" not found for update`);
        return false;
      }

      updateMessage(messageId, updates);

      return true;
    },
    [messages, messageExistsById, updateMessage]
  );

  const removeChatMessage = useCallback(
    (messageId: string): boolean => {
      if (!messages) {
        console.warn("Cannot remove message: session not available");
        return false;
      }

      if (!messageExistsById(messageId)) {
        console.warn(`Message with id "${messageId}" not found for removal`);
        return false;
      }

      deleteMessage(messageId);

      return true;
    },
    [messages, messageExistsById, deleteMessage]
  );

  const clearAllMessages = useCallback(() => {
    if (!messages) {
      console.warn("Cannot clear messages: session not available");
      return false;
    }

    clearMessages();
    return true;
  }, [clearMessages, messages]);

  const removeSessionMessages = useCallback(() => {
    if (!messages) {
      console.warn("Cannot clear messages: session not available");
      return false;
    }

    removeSession();
    return true;
  }, [messages, removeSession]);

  // ===========================
  // SPECIALIZED OPERATIONS
  // ===========================

  const removeMessageByStepId = useCallback(
    (stepId: string): boolean => {
      const message = findMessageByStepId(stepId);
      if (!message) {
        console.warn(`Message with stepId "${stepId}" not found for removal`);
        return false;
      }
      return removeChatMessage(message.id);
    },
    [findMessageByStepId, removeChatMessage]
  );

  const updateMessageByStepId = useCallback(
    (stepId: string, updates: Partial<ChatMessage>): boolean => {
      const message = findMessageByStepId(stepId);
      if (!message) {
        console.warn(`Message with stepId "${stepId}" not found for update`);
        return false;
      }
      return updateChatMessage(message.id, updates);
    },
    [findMessageByStepId, updateChatMessage]
  );

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const messageCount = messages?.length || 0;
  const lastMessage = messages?.[messageCount - 1] || null;
  const hasMessages = messageCount > 0;
  const isSessionReady = !!messages;

  return {
    // State
    messages,
    messageCount,
    lastMessage,
    hasMessages,
    hasHydrated,
    isSessionReady,

    // Core CRUD operations
    addMessage: addChatMessage,
    updateMessage: updateChatMessage,
    removeMessage: removeChatMessage,
    clearMessages: clearAllMessages,
    removeSession: removeSessionMessages,

    // Specialized operations
    removeMessageByStepId,
    updateMessageByStepId,

    // Query helpers
    findMessageById,
    findMessageByStepId,
    messageExistsById,
    messageExistsByStepId,
  };
}

export type SessionChatEngineReturn = ReturnType<typeof useChatEngine>;
