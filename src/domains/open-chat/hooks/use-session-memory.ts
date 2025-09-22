import { useCallback, useState } from "react";

import { deductCredits } from "@/app/actions/credit-actions";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { generateSessionMemory } from "@/domains/session-memory/session-memory.action";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
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

        const result = await generateSessionMemory(userMessage, session.memoryStore);
        if (!result) {
          const error = "Memory generation failed - no response received";
          console.error(error);
          setMemoryError(error);
          return { error };
        }

        const { modelTokenUsage, message, consumedCredits } = result;
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
                // Resolve authId from database user ID
                const user = await prisma.user.findUnique({
                  where: { id: userProfile.userId },
                  select: { authId: true },
                });

                if (!user?.authId) {
                  throw new Error("User authId not found");
                }

                // Use exact credits from AI response
                const memoryCredits = consumedCredits || 0;
                if (memoryCredits > 0) {
                  await deductCredits(user.authId, memoryCredits, "memory_generation", sessionId, {
                    inputTokens,
                    outputTokens,
                    userMessage: userMessage.substring(0, 100), // First 100 chars for tracking
                  });
                }
              } catch (error) {
                logger.logWarning("Failed to deduct credits for memory generation", {
                  operation: "session_memory_credit_deduction_failed",
                  sessionId,
                  userId: userProfile?.userId,
                  metadata: {
                    error: error instanceof Error ? error.message : String(error),
                    inputTokens,
                    outputTokens,
                  },
                });
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
          // Replace memory with AI-optimized version instead of appending
          const optimizedMemory = memoryArray.join("\n");

          // Validate memory size (warn if over 400 words)
          const wordCount = optimizedMemory.split(/\s+/).length;
          if (wordCount > 400) {
            logger.logInfo("Large memory size detected - consider optimization", {
              operation: "session_memory_size_warning",
              sessionId,
              metadata: {
                wordCount,
                optimizationSuggested: true,
              },
            });
          }

          return { ...prev, memoryStore: optimizedMemory };
        });

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        logger.logWarning("Memory update failed", {
          operation: "session_memory_update_failed",
          sessionId,
          userId: userProfile?.userId,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        setMemoryError(`Memory update failed: ${message}`);
        return { error: message };
      } finally {
        setIsUpdating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addTokenUsage, session, updateSession]
  );

  return {
    updateSessionMemory,
    isUpdating,
    memoryError,
  };
}
