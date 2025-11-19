import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { RelationalTrace } from "../reflection/types";
import { useConversationStore } from "../stores/use-conversation-store";
import { REFLECTION_DIRECTIVE_PROMPT } from "./prompt";
import { ReflectionDirective } from "./types";
import { buildReflectionDirectivePrompt } from "./utils";

export default function useHandleDirective() {
  const handleReflectionDirective = async (input: string, relationalTrace: RelationalTrace) => {
    const prompts = buildReflectionDirectivePrompt(input, relationalTrace);
    const aiResult = await processAiPromptsWithRetry(prompts, REFLECTION_DIRECTIVE_PROMPT.options);

    if (aiResult.error) {
      throw new Error(aiResult.error?.message || "No synthesis output");
    }
    if (!aiResult.data) {
      throw new Error("No synthesis output");
    }

    const directive = parseJsonObject(aiResult.data.message) as ReflectionDirective;

    useConversationStore.getState().addDirective(directive);

    return {
      response: directive,
      tokenUsage: aiResult.data.modelTokenUsage,
      elapsedMs: aiResult.data.elapsedMs,
    };
  };

  return {
    handleReflectionDirective,
  };
}
