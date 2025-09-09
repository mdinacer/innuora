import { useCallback } from "react";

import { generateSessionMemory } from "@/lib/ai/shared/session-memory/session-memory.action";
import { useChatSessionState } from "./use-session.state";

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
          const mergedMemory = [prev.sessionMemory, ...memoryArray].filter(Boolean).join("\n");
          return { ...prev, sessionMemory: mergedMemory };
        });
      } catch (error) {
        console.error("Error updating session memory:", error);
      }
    },
    [addTokenUsage, session, updateSession]
  );

  return { updateSessionMemory };
}
