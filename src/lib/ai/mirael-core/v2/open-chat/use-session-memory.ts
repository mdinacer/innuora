import { useCallback } from "react";

import { useChatSessionState } from "@/lib/ai/mirael-core/v2/open-chat/use-session.state";
import { generateSessionMemory } from "@/lib/ai/shared/session-memory/session-memory.action";

export default function useSessionMemory({ sessionId }: { sessionId: string }) {
  const { session, addTokenUsage, updateSession } = useChatSessionState({ sessionId });

  const updateSessionMemory = useCallback(
    async (userMessage: string) => {
      if (!session || !userMessage.trim()) return;

      try {
        const result = await generateSessionMemory(userMessage);
        if (!result) return;

        const { modelTokenUsage, message } = result;
        if (!message?.trim()) return;

        if (modelTokenUsage) {
          addTokenUsage({ ...modelTokenUsage, type: "memory" });
        }

        let memoryArray: string[];
        try {
          memoryArray = JSON.parse(message);
        } catch (err) {
          console.error("Invalid memory JSON:", message, err);
          return;
        }

        updateSession((prev) => {
          const mergedMemory = [prev.memoryStore, ...memoryArray].filter(Boolean).join("\n");
          return { ...prev, memoryStore: mergedMemory };
        });

        return { success: true };
      } catch (error) {
        console.error("Error updating session memory:", error);
        return { error: "Failed to update session memory" };
      }
    },
    [addTokenUsage, session, updateSession]
  );

  return { updateSessionMemory };
}
