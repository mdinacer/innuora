import { useCallback } from "react";

import { generateSessionMemory } from "@/lib/ai/shared/session-memory/session-memory.action";
import { useSessionServices } from "@/lib/points/simple-points";
import { useChatSessionState } from "./use-session.state";

export default function useSessionMemory({ sessionId }: { sessionId: string }) {
  const { session, addTokenUsage, updateSession } = useChatSessionState({ sessionId });
  const { requestMemoryEnhancement, canAffordService } = useSessionServices();

  const updateSessionMemory = useCallback(
    async (userMessage: string) => {
      if (!session || !userMessage.trim()) return;

      // Check if user can afford memory enhancement
      const affordabilityCheck = canAffordService("memory_enhancement");
      if (!affordabilityCheck.canAfford) {
        console.warn("Cannot afford memory enhancement:", affordabilityCheck.reason);
        return { error: "Insufficient points for memory enhancement", cost: affordabilityCheck.cost };
      }

      try {
        // Consume points for memory enhancement
        const pointsResult = await requestMemoryEnhancement(sessionId);
        if (!pointsResult.success) {
          console.error("Failed to consume points for memory enhancement:", pointsResult.error);
          return { error: pointsResult.error };
        }
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

        return { success: true, pointsConsumed: pointsResult.cost };
      } catch (error) {
        console.error("Error updating session memory:", error);
        return { error: "Failed to update session memory" };
      }
    },
    [addTokenUsage, session, updateSession, canAffordService, requestMemoryEnhancement, sessionId]
  );

  return { updateSessionMemory };
}
