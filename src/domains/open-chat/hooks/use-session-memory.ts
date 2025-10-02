import { useCallback, useState } from "react";

import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { generateSessionMemory } from "@/domains/session-memory/session-memory.action";
import { logger } from "@/lib/logging/unified-logger";
import { useAppUserStore } from "@/stores/app-user.store";

export default function useSessionMemory({ sessionId }: { sessionId: string }) {
  const { session, addTokenUsage, updateSession, addCreditsUsed } = useSessionState({ sessionId });
  const appUser = useAppUserStore((state) => state.user);
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

        // Call generateSessionMemory with authId and sessionId for credit tracking
        const result = await generateSessionMemory(userMessage, session.memoryStore, appUser?.authId, sessionId);

        // Unwrap ActionResult
        if (result.error) {
          const error = `Memory generation failed: ${result.error.message}`;
          console.error(error);
          setMemoryError(error);
          return { error };
        }

        const memoryResult = result.data;
        if (!memoryResult) {
          const error = "Memory generation failed - no response received";
          console.error(error);
          setMemoryError(error);
          return { error };
        }

        const { tokenUsage, memory, creditsUsed } = memoryResult;
        if (!memory?.trim()) {
          const error = "Memory generation returned empty response";
          console.error(error);
          setMemoryError(error);
          return { error };
        }

        // Track token usage in session metadata (credits already deducted in action)
        if (tokenUsage) {
          addTokenUsage({ ...tokenUsage, type: "memory" });
        }

        // Track credits used in session metadata
        if (creditsUsed > 0) {
          addCreditsUsed(creditsUsed);
        }

        let memoryArray: string[];
        try {
          memoryArray = JSON.parse(memory);
        } catch (err) {
          const error = "Invalid JSON in memory generation result";
          console.error(error, memory, err);
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
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        logger.logWarning("Memory update failed", {
          operation: "session_memory_update_failed",
          sessionId,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
            authId: appUser?.authId,
          },
        });
        setMemoryError(`Memory update failed: ${errorMessage}`);
        return { error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addTokenUsage, addCreditsUsed, session, updateSession, appUser?.authId]
  );

  return {
    updateSessionMemory,
    isUpdating,
    memoryError,
  };
}
