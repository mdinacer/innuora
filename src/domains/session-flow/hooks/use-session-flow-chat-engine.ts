// =======================
// SESSION FLOW CHAT ENGINE HOOK
// =======================

import { useCallback, useEffect, useState } from "react";

import { useSessionFlowMessagesStore } from "@/domains/session-flow/stores/session-flow-messages.store";
import { SessionFlowActionResult } from "@/domains/session-flow/types/session-flow-state.types";
import { createSessionFlowError } from "@/domains/session-flow/utils/session-flow-validation";
import { ChatMessage } from "@/types/flow-chat-messages.types";

export interface UseSessionFlowChatEngineOptions {
  sessionId: string;
  autoCreate?: boolean;
}

export function useSessionFlowChatEngine({ sessionId, autoCreate = false }: UseSessionFlowChatEngineOptions) {
  const [isLoading, setIsLoading] = useState(false);

  // Store selectors
  const messages = useSessionFlowMessagesStore((state) => state.getMessages(sessionId));
  const messageCount = useSessionFlowMessagesStore((state) => state.getMessageCount(sessionId));
  const lastMessage = useSessionFlowMessagesStore((state) => state.getLastMessage(sessionId));
  const error = useSessionFlowMessagesStore((state) => state.getError(sessionId));

  // Store actions
  const {
    createSession,
    removeSession,
    addMessage,
    updateMessage,
    deleteMessage,
    deleteMessageByStepId,
    clearMessages,
    getMessageById,
    getMessageByStepId,
    messageExists,
    messageExistsByStepId,
    setError,
    clearError,
  } = useSessionFlowMessagesStore();

  // Auto-create session if needed
  useEffect(() => {
    if (autoCreate && !messages) {
      try {
        createSession(sessionId);
      } catch (error) {
        const sessionError = createSessionFlowError(
          "INITIALIZATION_ERROR",
          error instanceof Error ? error.message : "Failed to auto-create message session",
          undefined,
          { sessionId }
        );
        setError(sessionId, sessionError);
      }
    }
  }, [sessionId, autoCreate, messages, createSession, setError]);

  // Enhanced action wrappers with error handling
  const safeCreateSession = useCallback((): SessionFlowActionResult => {
    try {
      setIsLoading(true);
      clearError(sessionId);

      if (messages) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Message session already exists", undefined, { sessionId }),
        };
      }

      createSession(sessionId);

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "INITIALIZATION_ERROR",
        error instanceof Error ? error.message : "Failed to create message session",
        undefined,
        { sessionId }
      );
      setError(sessionId, sessionError);
      return { success: false, error: sessionError };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, messages, createSession, setError, clearError]);

  const safeAddMessage = useCallback(
    (message: ChatMessage): SessionFlowActionResult<ChatMessage> => {
      try {
        setIsLoading(true);
        clearError(sessionId);

        if (!messages) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Message session does not exist", undefined, {
              sessionId,
            }),
          };
        }

        // Check for duplicates
        if (messageExists(sessionId, message.id)) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Message with this ID already exists", undefined, {
              sessionId,
              messageId: message.id,
            }),
          };
        }

        if (message.flowStepId && messageExistsByStepId(sessionId, message.flowStepId)) {
          return {
            success: false,
            error: createSessionFlowError(
              "VALIDATION_ERROR",
              "Message with this step ID already exists",
              message.flowStepId,
              { sessionId }
            ),
          };
        }

        addMessage(sessionId, message);

        return { success: true, data: message };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "VALIDATION_ERROR",
          error instanceof Error ? error.message : "Failed to add message",
          message.flowStepId,
          { sessionId, messageId: message.id }
        );
        setError(sessionId, sessionError);
        return { success: false, error: sessionError };
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, messages, messageExists, messageExistsByStepId, addMessage, setError, clearError]
  );

  const safeUpdateMessage = useCallback(
    (
      messageId: string,
      updater: Partial<ChatMessage> | ((message: ChatMessage) => ChatMessage)
    ): SessionFlowActionResult<ChatMessage> => {
      try {
        setIsLoading(true);
        clearError(sessionId);

        if (!messages) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Message session does not exist", undefined, {
              sessionId,
            }),
          };
        }

        const existingMessage = getMessageById(sessionId, messageId);
        if (!existingMessage) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Message not found", undefined, { sessionId, messageId }),
          };
        }

        updateMessage(sessionId, messageId, updater);

        const updatedMessage = getMessageById(sessionId, messageId);

        return { success: true, data: updatedMessage };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "VALIDATION_ERROR",
          error instanceof Error ? error.message : "Failed to update message",
          undefined,
          { sessionId, messageId }
        );
        setError(sessionId, sessionError);
        return { success: false, error: sessionError };
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, messages, getMessageById, updateMessage, setError, clearError]
  );

  const safeDeleteMessage = useCallback(
    (messageId: string): SessionFlowActionResult => {
      try {
        setIsLoading(true);
        clearError(sessionId);

        if (!messages) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Message session does not exist", undefined, {
              sessionId,
            }),
          };
        }

        if (!messageExists(sessionId, messageId)) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Message not found", undefined, { sessionId, messageId }),
          };
        }

        deleteMessage(sessionId, messageId);

        return { success: true };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "VALIDATION_ERROR",
          error instanceof Error ? error.message : "Failed to delete message",
          undefined,
          { sessionId, messageId }
        );
        setError(sessionId, sessionError);
        return { success: false, error: sessionError };
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, messages, messageExists, deleteMessage, setError, clearError]
  );

  const safeDeleteMessageByStepId = useCallback(
    (stepId: string): SessionFlowActionResult => {
      try {
        setIsLoading(true);
        clearError(sessionId);

        if (!messages) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Message session does not exist", undefined, {
              sessionId,
            }),
          };
        }

        if (!messageExistsByStepId(sessionId, stepId)) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Message with step ID not found", stepId, { sessionId }),
          };
        }

        deleteMessageByStepId(sessionId, stepId);

        return { success: true };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "VALIDATION_ERROR",
          error instanceof Error ? error.message : "Failed to delete message by step ID",
          stepId,
          { sessionId }
        );
        setError(sessionId, sessionError);
        return { success: false, error: sessionError };
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, messages, messageExistsByStepId, deleteMessageByStepId, setError, clearError]
  );

  const safeClearMessages = useCallback((): SessionFlowActionResult => {
    try {
      setIsLoading(true);
      clearError(sessionId);

      if (!messages) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Message session does not exist", undefined, { sessionId }),
        };
      }

      clearMessages(sessionId);

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Failed to clear messages",
        undefined,
        { sessionId }
      );
      setError(sessionId, sessionError);
      return { success: false, error: sessionError };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, messages, clearMessages, setError, clearError]);

  const safeRemoveSession = useCallback((): SessionFlowActionResult => {
    try {
      setIsLoading(true);

      if (!messages) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Message session does not exist", undefined, { sessionId }),
        };
      }

      removeSession(sessionId);

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Failed to remove message session",
        undefined,
        { sessionId }
      );
      return { success: false, error: sessionError };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, messages, removeSession]);

  // Query helpers
  const findMessageById = useCallback(
    (messageId: string) => {
      return getMessageById(sessionId, messageId);
    },
    [sessionId, getMessageById]
  );

  const findMessageByStepId = useCallback(
    (stepId: string) => {
      return getMessageByStepId(sessionId, stepId);
    },
    [sessionId, getMessageByStepId]
  );

  const messageExistsById = useCallback(
    (messageId: string) => {
      return messageExists(sessionId, messageId);
    },
    [sessionId, messageExists]
  );

  const messageExistsByStep = useCallback(
    (stepId: string) => {
      return messageExistsByStepId(sessionId, stepId);
    },
    [sessionId, messageExistsByStepId]
  );

  // Computed values
  const isSessionReady = Boolean(messages);
  const hasMessages = messageCount > 0;
  const hasError = Boolean(error);

  return {
    // State
    messages: messages || [],
    messageCount,
    lastMessage,
    hasMessages,
    isSessionReady,
    isLoading,
    hasError,
    error,

    // Session management
    createSession: safeCreateSession,
    removeSession: safeRemoveSession,

    // Message management
    addMessage: safeAddMessage,
    updateMessage: safeUpdateMessage,
    deleteMessage: safeDeleteMessage,
    deleteMessageByStepId: safeDeleteMessageByStepId,
    clearMessages: safeClearMessages,

    // Query helpers
    findMessageById,
    findMessageByStepId,
    messageExistsById,
    messageExistsByStepId: messageExistsByStep,

    // Utility
    clearError: () => clearError(sessionId),
  };
}
