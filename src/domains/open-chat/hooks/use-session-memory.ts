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
          setMemoryError(error);
          return { error };
        }

        if (!userMessage.trim()) {
          const error = "User message is required for memory update";
          setMemoryError(error);
          return { error };
        }

        // NOTE: Server action now fetches existing memory from encrypted storage
        // and saves new memory server-side. Client no longer manages memory.
        const result = await generateSessionMemory(userMessage, appUser?.authId, sessionId);

        // Unwrap ActionResult
        if (result.error) {
          const error = `Memory generation failed: ${result.error.message}`;
          setMemoryError(error);
          return { error };
        }

        const memoryResult = result.data;
        if (!memoryResult) {
          const error = "Memory generation failed - no response received";
          setMemoryError(error);
          return { error };
        }

        const { tokenUsage, memory, creditsUsed } = memoryResult;
        if (!memory?.trim()) {
          const error = "Memory generation returned empty response";
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
        } catch {
          const error = "Invalid JSON in memory generation result";

          setMemoryError(error);
          return { error };
        }

        if (!Array.isArray(memoryArray)) {
          const error = "Memory result is not an array";

          setMemoryError(error);
          return { error };
        }

        // NOTE: Memory is now stored server-side only - no client-side update needed
        // updateSession() call REMOVED - server handles storage automatically

        // Validate memory size (warn if over 400 words)
        const optimizedMemory = memoryArray.join("\n");
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
