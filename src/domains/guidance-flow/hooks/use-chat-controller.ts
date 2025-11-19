"use client";

import { useState } from "react";

import { processUserInput } from "@/domains/guidance-flow/actions/conversation-actions";
import useSessionPhaseEvaluation from "@/domains/guidance-flow/phase/hook";
import { useActiveSessionStore } from "@/domains/guidance-flow/stores/active-session-store";
import { ConversationMessage } from "@/domains/guidance-flow/types/chat-message";
import { generateId, generateMessageId } from "@/domains/session-flow/utils/generate-id";
import { logger } from "@/lib/logging/logger.client";
import { useCrisisStore } from "@/stores/crisis-store";
import { CrisisEvent } from "@/types/crisis-event";

export default function useChatController() {
  const [isProcessing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const session = useActiveSessionStore((s) => {
    if (!s.session) throw new Error("Session missing");
    return s.session;
  });

  useSessionPhaseEvaluation(session.id); // Run session phase evaluation check

  const handleUserInput = async (userInput: string) => {
    if (!userInput.trim().length) {
      console.warn("No input provided");
      return;
    }

    setProcessing(true);
    try {
      const sessionStore = useActiveSessionStore.getState();
      const crisisStore = useCrisisStore.getState();

      const messagesWindow = [...session.messages].slice(-8);

      sessionStore.appendMessage({
        id: generateMessageId(),
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      });

      const reflectionResults = await processUserInput(session.id, userInput, messagesWindow);

      if (reflectionResults.crisis) {
        const crisisEvent: CrisisEvent = {
          id: generateId("crisis"),
          detectedAt: Date.now(),
          level: reflectionResults.crisis.level,
          confirmedSafe: false,
          source: "reflection",
          notes: reflectionResults.crisis.notes,
        };
        crisisStore.addEvent(crisisEvent);
        return;
      }

      if (reflectionResults.reflection) {
        const assistantMessage: ConversationMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: reflectionResults.reflection,
          psychoeducation: reflectionResults.psychoeducation,
          next_action: reflectionResults.action,
          follow_up_question: reflectionResults.followUpQuestion,
          timestamp: Date.now(),
        };
        sessionStore.appendMessage(assistantMessage);
      } else {
        setLastFailedMessage(userInput);
      }
    } catch (error: unknown) {
      setLastFailedMessage(userInput);
      setError(error instanceof Error ? error.message : String(error));
      logger.logWarning("Chat processing error occurred", {
        operation: "chat_controller_process_error",
        sessionId: session.id,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetSession = () => {
    useActiveSessionStore.getState().clearMessages();
  };

  return {
    session,
    isProcessing,
    error,
    lastFailedMessage,
    handleUserInput,
    resetSession,
    setLastFailedMessage,
  };
}
