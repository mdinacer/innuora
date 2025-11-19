import { useEffect, useRef } from "react";
import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { useConversationStore } from "../stores/use-conversation-store";
import { useTelemetryStore } from "../stores/use-telemetry-store";
import { SESSION_WELLNESS_PROMPT } from "./prompt";
import { SessionWellness } from "./types";
import { buildSessionWellnessInput } from "./utils";

export default function useWellnessCheck() {
  const messages = useConversationStore((state) => state.messages);
  const lastCheckRef = useRef<number>(0);

  const handleWellnessCheck = async () => {
    const conversationStore = useConversationStore.getState();
    const telemetryStore = useTelemetryStore.getState();
    const { messages, lastWellnessCheck } = conversationStore;

    const userMessages = messages.filter((m) => m.role === "user");

    if (userMessages.length === 0) return null;

    const inputContext = buildSessionWellnessInput(messages, lastWellnessCheck || undefined);

    const prompts: ChatCompletionMessageParam[] = [
      { role: "system", content: SESSION_WELLNESS_PROMPT.instructions },
      inputContext,
    ];

    const aiResults = await processAiPromptsWithRetry(prompts, SESSION_WELLNESS_PROMPT.options);
    if (aiResults.error) throw new Error(aiResults.error.message || "Wellness check failed");
    if (!aiResults.data) throw new Error("No wellness data returned");

    const wellnessCheck = parseJsonObject(aiResults.data.message) as SessionWellness;
    conversationStore.addWellnessCheck(wellnessCheck);
    lastCheckRef.current = userMessages.length;

    if (aiResults.data.modelTokenUsage) {
      telemetryStore.updateTokenTelemetry("background", "session_wellness", aiResults.data.modelTokenUsage);
    }

    console.log("[Innuora] ✅ Wellness check run:", wellnessCheck);

    return {
      data: wellnessCheck,
      tokenUsage: aiResults.data.modelTokenUsage,
      elapsedMs: aiResults.data.elapsedMs,
    };
  };

  // Automatically run every time total user message count hits a multiple of 10
  useEffect(() => {
    const userCount = messages.filter((m) => m.role === "user").length;
    const lastCheck = lastCheckRef.current;

    const shouldRun = userCount > 0 && userCount % 5 === 0 && userCount !== lastCheck;

    if (shouldRun) {
      handleWellnessCheck().catch((err) => {
        console.error("[Innuora] Wellness check error:", err);
      });
    }
  }, [messages]);

  return { handleWellnessCheck };
}
