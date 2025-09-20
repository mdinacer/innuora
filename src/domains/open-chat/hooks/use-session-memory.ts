import { useCallback, useState } from "react";

import { calculateAIMessageCost, deductCredits } from "@/app/actions/credit-actions";
import { MODELS_CODES } from "@/domains/ai-conversation/ai-models";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { generateSessionMemory } from "@/domains/session-memory/session-memory.action";
import { useUserDataStore } from "@/stores/user-data.store";

export default function useSessionMemory({ sessionId }: { sessionId: string }) {
  const { session, addTokenUsage, updateSession } = useSessionState({ sessionId });
  const userProfile = useUserDataStore((state) => state.profile);
  const [isUpdating, setIsUpdating] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);

  const updateSessionMemory = useCallback(
    async (userMessage: string) => {
      setMemoryError(null);
      setIsUpdating(true);

      try {
        if (!session) {
          const error = "No session available for memory update";
          console.error(error);
          setMemoryError(error);
          return { error };
        }

        if (!userMessage.trim()) {
          const error = "User message is required for memory update";
          console.error(error);
          setMemoryError(error);
          return { error };
        }

        const result = await generateSessionMemory(userMessage);
        if (!result) {
          const error = "Memory generation failed - no response received";
          console.error(error);
          setMemoryError(error);
          return { error };
        }

        const { modelTokenUsage, message } = result;
        if (!message?.trim()) {
          const error = "Memory generation returned empty response";
          console.error(error);
          setMemoryError(error);
          return { error };
        }

        // Track token usage and deduct credits for memory AI call
        if (modelTokenUsage) {
          addTokenUsage({ ...modelTokenUsage, type: "memory" });

          // Deduct credits for memory generation AI call
          if (userProfile?.userId) {
            const inputTokens = modelTokenUsage.usage?.prompt_tokens ?? 0;
            const outputTokens = modelTokenUsage.usage?.completion_tokens ?? 0;

            if (inputTokens > 0 || outputTokens > 0) {
              try {
                const memoryCredits = await calculateAIMessageCost(MODELS_CODES.M1, inputTokens, outputTokens);
                await deductCredits(userProfile.userId, memoryCredits, "memory_generation", sessionId, {
                  inputTokens,
                  outputTokens,
                  userMessage: userMessage.substring(0, 100), // First 100 chars for tracking
                });
              } catch (error) {
                console.warn("Failed to deduct credits for memory generation:", error);
                // Don't fail the memory update if credit deduction fails
              }
            }
          }
        }

        let memoryArray: string[];
        try {
          memoryArray = JSON.parse(message);
        } catch (err) {
          const error = "Invalid JSON in memory generation result";
          console.error(error, message, err);
          setMemoryError(error);
          return { error };
        }

        if (!Array.isArray(memoryArray)) {
          const error = "Memory result is not an array";
          console.error(error, memoryArray);
          setMemoryError(error);
          return { error };
        }

        updateSession((prev) => {
          const mergedMemory = [prev.memoryStore, ...memoryArray].filter(Boolean).join("\n");
          return { ...prev, memoryStore: mergedMemory };
        });

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Memory update failed:", error);
        setMemoryError(`Memory update failed: ${message}`);
        return { error: message };
      } finally {
        setIsUpdating(false);
      }
    },
    [addTokenUsage, session, updateSession]
  );

  return {
    updateSessionMemory,
    isUpdating,
    memoryError,
  };
}
