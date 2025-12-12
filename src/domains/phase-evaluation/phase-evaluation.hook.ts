import { useEffect, useRef } from "react";

import { useActiveSessionStore } from "../session-state/session-state.store";
import { evaluateSessionPhase } from "./phase-evaluation.actions";

export default function useSessionPhaseEvaluation(sessionId: string) {
  const messages = useActiveSessionStore((state) => {
    if (!state.session) return [];
    return state.session.messages;
  });
  const lastCheckRef = useRef<number>(0);

  const handlePhaseEvaluation = async () => {
    const conversationStore = useActiveSessionStore.getState();

    const messages = conversationStore.session?.messages || [];

    const userMessages = messages.filter((m) => m.role === "user");

    if (userMessages.length === 0) return null;

    const aiResults = await evaluateSessionPhase(sessionId, userMessages);
    if (!aiResults.data) throw new Error("No wellness data returned");

    const wellnessCheck = aiResults.data;
    lastCheckRef.current = userMessages.length;

    console.log("[Innuora] ✅ Wellness check run:", wellnessCheck);
  };

  // Automatically run every time total user message count hits a multiple of 10
  useEffect(() => {
    const userCount = messages.filter((m) => m.role === "user").length;
    const lastCheck = lastCheckRef.current;

    const shouldRun = userCount > 0 && userCount % 5 === 0 && userCount !== lastCheck;

    if (shouldRun) {
      handlePhaseEvaluation().catch((err) => {
        console.error("[Innuora] Wellness check error:", err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return { handleWellnessCheck: handlePhaseEvaluation };
}
