import { useCallback, useState } from "react";

import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { generateSessionMemory } from "@/domains/session-memory/session-memory.action";

export default function useSessionMemory({ sessionId }: { sessionId: string }) {
  const { session, addTokenUsage, updateSession } = useSessionState({ sessionId });
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

        if (modelTokenUsage) {
          addTokenUsage({ ...modelTokenUsage, type: "memory" });
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
