import { useState } from "react";

import { handleConversation } from "../actions/conversation.actions";
import { useConversationStore } from "../stores/conversation.store";
import type { ConversationMessage } from "../types/continuous-memory.types";

export function useConversation() {
  const { messages, memory, isLoading, addMessage, updateMemory, setLoading, setError } = useConversationStore();

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    try {
      setLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMsg: ConversationMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);

      // Call server action
      const result = await handleConversation(userMessage, messages, memory);

      if (result.error) {
        setError(result.error);
      }

      // Add assistant message
      const assistantMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.assistantMessage,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMsg);

      // Update memory
      updateMemory(result.updatedMemory);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    memory,
    isLoading,
    sendMessage,
  };
}
