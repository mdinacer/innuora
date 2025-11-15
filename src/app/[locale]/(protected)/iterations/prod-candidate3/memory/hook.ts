import { useState } from "react";
import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { useConversationStore } from "../stores/use-conversation-store";
import { MEMORY_ANALYSIS_PROMPT } from "./prompt";
import { MemoryAnalysis } from "./types";
import { buildMemoryIndex } from "./utils";

export default function useAnalyzeMemory() {
  const [extracting, setExtracting] = useState(false);

  const handleMemoryAnalysis = async (userInput: string) => {
    if (!userInput.trim().length) {
      throw new Error("No input provided");
    }

    setExtracting(true);

    try {
      const conversationStore = useConversationStore.getState();
      const { factualMemory } = conversationStore;

      const anchors = factualMemory.length > 0 ? buildMemoryIndex(factualMemory) : undefined;
      const prompts: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: MEMORY_ANALYSIS_PROMPT.instructions.replace(
            "{{ANCHORS}}",
            anchors
              ? `
---

### Context for Recall

Known anchors from previous messages (for recall only):
${JSON.stringify(anchors)}

Use these anchors only to:
- identify when a message is recalling a known person, place, or theme,
- align normalization (use existing tokens instead of inventing new ones).

Do NOT restate or re-extract these anchors unless new, unrelated information appears.

---
END OF ANCHORS CONTEXT
`.trim()
              : ""
          ),
        },
        { role: "user", content: userInput.trim() },
      ];

      const aiResults = await processAiPromptsWithRetry(prompts, MEMORY_ANALYSIS_PROMPT.options);

      if (aiResults.error) throw new Error(aiResults.error.message || "Extraction failed");
      if (!aiResults.data) throw new Error("No model output received");

      // The model returns an object with { facts: FactualMemory[] }
      const parsedMemory = parseJsonObject(aiResults.data.message) as MemoryAnalysis;

      conversationStore.addFacts(parsedMemory.extracted_memories);

      return {
        data: parsedMemory,
        tokenUsage: aiResults.data.modelTokenUsage,
        elapsedMs: aiResults.data.elapsedMs,
      };
    } catch (error) {
      console.error("[useExtractMemory] Error:", error);
      return { data: null, tokenUsage: null, elapsedMs: 0, error };
    } finally {
      setExtracting(false);
    }
  };

  return {
    extracting,
    handleMemoryAnalysis,
  };
}
